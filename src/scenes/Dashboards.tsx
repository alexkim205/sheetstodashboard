import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider, Link,
    Listbox, ListboxItem, Popover,
    PopoverContent,
    PopoverTrigger,
    Skeleton, Spinner, useDisclosure
} from "@nextui-org/react";
import {router} from "kea-router";
import {urls} from "../utils/routes";
import {useActions, useValues} from "kea";
import {dashboardGridLogic} from "../logics/dashboardGridLogic";
import {v4 as uuidv4} from "uuid";
import {AiOutlinePlus} from "react-icons/ai";
import clsx from "clsx";
import {RxDotsVertical, RxPencil1, RxTrash} from "react-icons/rx";
import {LuPlus} from "react-icons/lu";
import {LinkedAccountsModal} from "../components/Modal/LinkedAccountsModal";

function Dashboards() {
    const {dashboards, dashboardsLoading} = useValues(dashboardGridLogic)
    const {deleteDashboard} = useActions(dashboardGridLogic)
    const linkedAccountsModalDisclosureProps = useDisclosure()

    return (
        <>
            <div className="flex flex-col w-full max-w-[1024px] min-h-[calc(100vh-64px)] pt-12 px-6 sm:gap-6 gap-4">
                <>
                    <div>
                        <Button as={Link} onPress={() => linkedAccountsModalDisclosureProps.onOpen()}
                                color="primary" size="lg" radius="md"
                                className="font-medium"
                                startContent={<LuPlus className="text-xl"/>}
                        >
                            Add data sources
                        </Button>
                    </div>
                    <h2 className="sm:text-4xl text-3xl font-bold">Dashboards</h2>
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
                                    <Card
                                        key={dashboard.id} isPressable className="aspect-[4/3]"
                                        onPress={() => router.actions.push(urls.dashboard(dashboard.id))}
                                    >
                                        <CardHeader className="flex justify-between gap-3">
                                            <div className="flex flex-col text-left">
                                                <div
                                                    className={clsx("text-base font-semibold", !dashboard.data.title && "italic text-default-400")}>{dashboard.data.title || "Untitled"}</div>
                                                <div
                                                    className={clsx("text-sm text-default-400", !dashboard.data.description && "italic")}>{dashboard.data.description || "No description"}</div>
                                            </div>
                                            <div className="self-start">
                                                <Popover key={`${dashboard.id}-menu`} placement="bottom-end">
                                                    <PopoverTrigger>
                                                        <Button variant="light" size="md" isIconOnly>
                                                            <RxDotsVertical className="text-default-400 text-md"/>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
                                                        <Listbox
                                                            aria-label={`${dashboard.id}-menu-options`}
                                                        >
                                                            <ListboxItem
                                                                key="edit"
                                                                color="default"
                                                                startContent={<RxPencil1 className="text-lg"/>}
                                                                onClick={() => {
                                                                    router.actions.push(urls.dashboard(dashboard.id))
                                                                }}
                                                            >
                                                                Edit
                                                            </ListboxItem>
                                                            <ListboxItem
                                                                key="delete"
                                                                color="danger"
                                                                startContent={dashboardsLoading ?
                                                                    <Spinner color="white" size="sm"/> :
                                                                    <RxTrash className="text-lg"/>}
                                                                className={clsx(dashboardsLoading && "cursor-not-allowed opacity-60")}
                                                                onClick={() => {
                                                                    if (dashboardsLoading) {
                                                                        return
                                                                    }
                                                                    if (confirm('Are you sure you want to delete this dashboard?')) {
                                                                        deleteDashboard(dashboard.id)
                                                                    } else {
                                                                        // Do nothing!
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </ListboxItem>
                                                        </Listbox>
                                                    </PopoverContent>
                                                </Popover>
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
                </>
            </div>
            <LinkedAccountsModal {...linkedAccountsModalDisclosureProps}/>

        </>
    )
}

export default Dashboards
