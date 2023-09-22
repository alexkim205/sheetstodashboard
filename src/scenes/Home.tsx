import {Card, CardBody, CardHeader, Divider, Skeleton} from "@nextui-org/react";
import {router} from "kea-router";
import {urls} from "../utils/routes";
import {useValues} from "kea";
import {homeLogic} from "../logics/homeLogic";
import {v4 as uuidv4} from "uuid";
import {AiOutlinePlus} from "react-icons/ai";
import clsx from "clsx";

export function Home() {
    const {dashboards, dashboardsLoading} = useValues(homeLogic)

    return (
        <div className="flex flex-col w-full max-w-[1024px] px-6 sm:gap-8 gap-6">
            <h2 className="sm:text-3xl text-2xl font-bold">Dashboards</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-4">
                {dashboardsLoading ? (
                    [1, 2, 3].map((key) => (
                        <Card key={key} className="aspect-[4/3] flex flex-col p-4 space-y-3">
                            <Skeleton className="w-full rounded-lg">
                                <div className="h-6 rounded-lg bg-default-300"></div>
                            </Skeleton>
                            <Skeleton className="w-3/5 rounded-lg">
                                <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                            </Skeleton>
                            <Skeleton className="w-4/5 rounded-lg">
                                <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                            </Skeleton>
                            <Skeleton className="w-2/5 rounded-lg">
                                <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                            </Skeleton>
                        </Card>
                    ))
                ) : (
                    <>
                        {dashboards.map((dashboard) => (
                            <Card key={dashboard.id} isPressable className="aspect-[4/3]"
                                  onPress={() => router.actions.push(urls.dashboard(dashboard.id))}>
                                <CardHeader className="flex gap-3">
                                    <div className="flex flex-col text-left">
                                        <div className={clsx("text-base font-semibold", !dashboard.data.title && "italic text-default-400")}>{dashboard.data.title || "Untitled"}</div>
                                        <div className={clsx("text-sm text-default-400", !dashboard.data.description && "italic")}>{dashboard.data.description || "No description"}</div>
                                    </div>
                                </CardHeader>
                                <Divider/>
                                <CardBody className="flex justify-center items-center text-default-400">
                                    <span>{dashboard.dashboard_items.length} charts</span>
                                </CardBody>
                            </Card>
                        ))}
                        <Card key="new-dashboard" isPressable className="aspect-[4/3]"
                              onPress={() => router.actions.push(urls.dashboard(uuidv4()))}>
                            <CardBody className="justify-center items-center">
                                <span className="flex flex-row items-center gap-3 text-default-400"><AiOutlinePlus
                                    className="text-lg"/> Add dashboard</span>
                            </CardBody>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}