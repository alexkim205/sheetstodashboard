import {Database} from "./database.types";

export enum AxisType {
    Value = 'value',
    Category = 'category',
    Time = 'time',
    Log = 'log'
}

export enum PanelTab {
    ExpectedData = "expected_data",
    PreviewData = 'preview_data',
    Chart = 'chart'
}

export type DashboardType = Omit<Database["public"]["Tables"]["dashboards"]["Row"], "data"> & {data: DashboardDataType, dashboard_items: DashboardItemType[]}

export interface DashboardDataType {
    id: string
    title: string
    description: string
}

export type DashboardItemType = Omit<Database["public"]["Tables"]["dashboard_items"]["Row"], "data"> & {data: DashboardItemDataType}

export interface DashboardItemDataType {
    id: string
    type: ChartPresetType
    dataSourceId: string | undefined | null // data file id related to Microsoft Graph API
    dataRange: string | undefined // A1:C4
    selector: string // Sheet and range in this format, i.e. 'Sheet1'!A3:B9
    coordinates: {
        x: number,
        y: number,
        w: number,
        h: number
    },
    chart: {
        title: {
            text: string,
            subtext: string,
            textStyle: {
                fontSize: number
            },
            subtextStyle: {
                fontSize: number
            }
        }
        xAxis: {
            name: string
            type: AxisType | null
        }
        yAxis: {
            name: string
            type: AxisType | null
        }
    }
}

export enum ChartPresetType {
    BasicBar = "basic_bar",
    StackedBar = "stacked_bar",
    BasicLine = "basic_line",
    StackedLine = "stacked_line",
    AreaLine = "area_line",
    BasicPie = "basic_pie",
    RingPie = "ring_pie",
    BasicScatter = "basic_scatter"
}

export interface DataType {
    values: (string | number)[][]
}

export interface WorkbookType {
    id: string
    lastModifiedDateTime: string
    createdDateTime: string,
    name: string
}

export enum SupabaseTable {
    Dashboards = 'dashboards',
    DashboardItems = 'dashboard_items'
}