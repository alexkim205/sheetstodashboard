import {actions, afterMount, connect, defaults, kea, key, listeners, path, props, selectors} from "kea";
import {loaders} from "kea-loaders";
import {userLogic} from "./userLogic";
import {DashboardItemType, DashboardType, SupabaseTable, WorkbookType} from "../utils/types";
import merge from "lodash.merge"
import type {DeepPartial} from "kea-forms/lib/types";
import type {dashboardLogicType} from "./dashboardLogicType";
import supabase from "../utils/supabase";
import {generateEmptyDashboardData, generateEmptyDashboardItem} from "../utils/utils";
import type {Layouts} from "react-grid-layout";

export function graphFetch({url = "", method = "GET", providerToken, body}: {
    url: string,
    method?: "GET" | "POST",
    providerToken: string,
    body?: Record<string, any>
}) {
    return fetch(`https://graph.microsoft.com/v1.0/me/drive/${url}`, {
        method,
        headers: new Headers({
            Authorization: `Bearer ${providerToken}`,
            Host: "graph.microsoft.com"
        }),
        body: JSON.stringify(body)
    })
}

export interface DashboardLogicProps {
    id: DashboardType["id"]
    newDashboardItemId?: DashboardItemType["id"] // keep track of new item id at top level
}

export const dashboardLogic = kea<dashboardLogicType>([
    props({} as DashboardLogicProps),
    path((key) => ["src", "logics", "apiLogic", key]),
    key((props) => props.id),
    connect(() => ({
        values: [userLogic, ["providerToken", "user"]],
        actions: [userLogic, ["setUser"]]
    })),
    defaults(({props}) => ({
        dashboard: null as DashboardType | null,
        charts: [{
            id: props.newDashboardItemId,
            dashboard: props.id,
            data: generateEmptyDashboardItem(props.newDashboardItemId as string),
            created_at: null
        }] as DashboardItemType[],
        workbooks: [] as WorkbookType[],
    })),
    actions(() => ({
        setChart: (chart: DeepPartial<DashboardItemType>) => ({chart}),
        setCharts: (charts: DeepPartial<DashboardItemType>[]) => ({charts}),
        setDashboard: (dashboard: DeepPartial<DashboardType>) => ({dashboard}),
        onLayoutChange: (layouts: Layouts) => ({layouts})
    })),
    loaders(({values, props}) => ({
        dashboard: {
            loadDashboard: async (_, breakpoint) => {
                await breakpoint(100)
                const {data, error} = await supabase
                    .from(SupabaseTable.Dashboards)
                    .select()
                    .eq("user", values.user?.user.id)
                    .eq("id", props.id)
                    .maybeSingle()
                breakpoint()
                if (error) {
                    throw new Error(error.message)
                }

                if (data) {
                    return data
                }

                // If dashboard returns null, create it!
                const {data: insertData, error: insertError} = await supabase
                    .from(SupabaseTable.Dashboards)
                    .insert({
                        id: props.id,
                        user: values.user?.user.id,
                        data: generateEmptyDashboardData(props.id)
                    }).select().maybeSingle()
                if (insertError) {
                    throw new Error(insertError.message)
                }

                breakpoint()
                return insertData
            },
            setDashboard: ({dashboard}) => {
                return merge({}, values.dashboard, dashboard)
            },
            saveDashboard: async (_, breakpoint) => {
                await breakpoint(100)
                const {data, error} = await supabase
                    .from(SupabaseTable.Dashboards)
                    .update({
                        data: values.dashboard?.data
                    })
                    .eq("id", props.id)
                    .maybeSingle()
                breakpoint()
                if (error) {
                    throw new Error(error.message)
                }
                return data
            }
        },
        charts: {
            loadCharts: async (_, breakpoint) => {
                await breakpoint(100)

                const {data, error} = await supabase
                    .from(SupabaseTable.DashboardItems)
                    .select()
                    .eq("dashboard", props.id)
                    .eq("user", values.user?.user.id)
                breakpoint()
                if (error) {
                    throw new Error(error.message)
                }

                // pick out new dashboard item
                const newDashboardItem = values.charts.find(({id}) => id === props.newDashboardItemId)

                return [newDashboardItem, ...data]
            },
            setChart: ({chart}) => {
                return values.charts.map((thisChart) => thisChart.id === chart.id ? merge({}, thisChart, chart) : thisChart)
            },
            setCharts: ({charts}) => charts as DashboardItemType[],
        },
        workbooks: {
            loadWorkbooks: async (_, breakpoint) => {
                if (!values.providerToken) {
                    return values.workbooks
                }
                await breakpoint(1)
                const response = await graphFetch({url: "root/children", providerToken: values.providerToken})
                const data = await response.json()
                breakpoint()
                return data.value.filter(({name}: { name: string }) => name.endsWith(".xlsx")) ?? []
            }
        }
    })),
    listeners(({actions, values}) => ({
        setUser: ({user}) => {
            if (!user) {
                return
            }
            actions.loadDashboard({})
            actions.loadWorkbooks({})
        },
        loadDashboardSuccess: () => {
            actions.loadCharts({})
        },
        onLayoutChange: ({layouts}) => {
            const keys = layouts.sm.map(({i}) => i)
            const idToNewDimensions = Object.fromEntries(keys.map((i) => [i, {
                sm: layouts.sm.find(({i: thisI}) => thisI === i),
                md: layouts.md.find(({i: thisI}) => thisI === i),
                lg: layouts.lg.find(({i: thisI}) => thisI === i)
            }]))

            actions.setCharts(values.charts.map((chart) => merge({}, chart, {data: {coordinates: idToNewDimensions?.[chart.id] ?? chart.data.coordinates}})))
        }
    })),
    afterMount(({actions, values}) => {
        if (values.providerToken) {
            actions.loadDashboard({})
            actions.loadWorkbooks({})
        }
    }),
    selectors(() => ({
        layouts: [
            (s) => [s.charts],
            (charts) => {
                return {
                    sm: charts.map(chart => ({...chart.data.coordinates.sm, i: chart.id})),
                    md: charts.map(chart => ({...chart.data.coordinates.md, i: chart.id})),
                    lg: charts.map(chart => ({...chart.data.coordinates.lg, i: chart.id}))
                }
            }
        ],
    }))
])