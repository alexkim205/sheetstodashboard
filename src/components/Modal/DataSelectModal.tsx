import {
    Button,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    Select,
    SelectItem,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tabs,
    Textarea,
    Checkbox, Spinner, Chip, useDisclosure
} from "@nextui-org/react";
import {useActions, useValues} from "kea";
import {dashboardItemLogic, DashboardItemLogicProps} from "../../logics/dashboardItemLogic";
import {DashboardLogicProps} from "../../logics/dashboardLogic";
import {FormEvent, lazy, Suspense, useState} from "react";
import {MdGridOn, MdOutlineCheck, MdOutlineSync, MdOutlineWarningAmber} from "react-icons/md";
import {graphTypeTabs} from "./graph";
import {ChartPresetType, PanelTab, Provider} from "../../utils/types";
import {RxTrash} from "react-icons/rx";
import {userLogic} from "../../logics/userLogic";
import {LinkedAccountsModal} from "./LinkedAccountsModal";

const Chart = lazy(() => import('./Chart'))

export function DataSelectModal({props}: {
    dashboardProps: DashboardLogicProps,
    props: DashboardItemLogicProps
}) {
    const logic = dashboardItemLogic(props)
    const {linkedProviders} = useValues(userLogic)
    const {
        open,
        localMergedChart,
        isNew,
        parsedRange,
        dataLoading,
        syncable,
        synced,
        data,
        chartLoading,
        parsedWorkbookId,
        isDemoDashboard
    } = useValues(logic)
    const {setOpen, setLocalChart, fetchData, saveThisChart, deleteThisChart} = useActions(logic)
    const [dataTableTab, setDataTableTab] = useState<PanelTab>(PanelTab.Chart)
    const linkedAccountsModalDisclosureProps = useDisclosure()

    console.log("DEMO", isDemoDashboard)

    const ThisChartIcon = graphTypeTabs[localMergedChart.data.type].Icon
    const renderChartInputFields = () => <>
        <Input type="text" key="chart-title-field" name="chart-title-field"
               id="chart-title-field" label="Title" placeholder="Name this chart"
               labelPlacement="outside" value={localMergedChart?.data?.chart?.title?.text}
               onChange={(event: FormEvent<HTMLInputElement>) => {
                   setLocalChart({data: {chart: {title: {text: event.currentTarget.value}}}})
               }}/>
        <Textarea
            name="chart-description-field"
            label="Description (optional)"
            labelPlacement="outside"
            minRows={2}
            cacheMeasurements
            value={localMergedChart?.data?.chart?.title?.subtext}
            onValueChange={(value) => {
                setLocalChart({data: {chart: {title: {subtext: value}}}})
            }}
            type="text"
            placeholder="Write a description"
        />
        {![ChartPresetType.RingPie, ChartPresetType.BasicPie].includes(localMergedChart.data.type) && (
            <>
                <Input type="text" key="chart-xaxis-field" name="chart-xaxis-field"
                       id="chart-xaxis-field" label="X-axis label"
                       placeholder="Time"
                       labelPlacement="outside"
                       value={localMergedChart?.data?.chart?.xAxis?.name}
                       onChange={(event: FormEvent<HTMLInputElement>) => {
                           setLocalChart({data: {chart: {xAxis: {name: event.currentTarget.value}}}})
                       }}/>
                <Input type="text" key="chart-yaxis-field" name="chart-yaxis-field"
                       id="chart-yaxis-field" label="Y-axis label"
                       placeholder="Units"
                       labelPlacement="outside"
                       value={localMergedChart?.data?.chart?.yAxis?.name}
                       onChange={(event: FormEvent<HTMLInputElement>) => {
                           setLocalChart({data: {chart: {yAxis: {name: event.currentTarget.value}}}})
                       }}/>
            </>
        )}
        <Checkbox
            size="sm"
            className="font-medium"
            isSelected={!!localMergedChart?.data?.chart?.legend?.show}
            onValueChange={(nextSelected) => setLocalChart({data: {chart: {legend: {show: nextSelected}}}})}>
            Show legend
        </Checkbox>
    </>


    const dataTypeTabs = {
        [Provider.Azure]: {
            id: Provider.Azure,
            label: "Microsoft Excel",
            unlinked: !linkedProviders[Provider.Azure]
        },
        [Provider.Google]: {
            id: Provider.Google,
            label: "Google Sheets",
            unlinked: !linkedProviders[Provider.Google]
        },
        /*    [Provider.Raw]: {
                id: Provider.Raw,
                label: "Raw Data",
            },*/
    }

    return (
        <>
            <Modal
                size="full"
                isOpen={open}
                onClose={() => setOpen(false)}
                classNames={{
                    body: "p-0",
                    wrapper: "sm:p-8 p-1.5"
                }}
                className="!rounded-large max-w-7xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody className="overflow-y-auto">
                                <div className="px-6 flex flex-row sm:flex-col gap-2">
                                    <div className="flex flex-col justify-between sm:flex-row gap-3 w-full sm:gap-6">
                                        <div className="flex flex-col w-full sm:w-[calc(33%-0.75rem)] py-6 gap-3">
                                            <h2 className="text-lg font-bold">Data</h2>
                                            <Select placeholder="Data type" aria-label="Data type"
                                                    labelPlacement="outside" label="Data type"
                                                    isDisabled={isDemoDashboard}
                                                    startContent={<MdGridOn className="text-lg"/>}
                                                    selectedKeys={new Set(localMergedChart?.data?.srcProvider ? [String(localMergedChart.data.srcProvider)] : [])}
                                                    onSelectionChange={(keys) => {
                                                        if (isDemoDashboard) {
                                                            return
                                                        }
                                                        const nextProvider = Array.from(keys)?.[0] ? String(Array.from(keys)[0]) as Provider : undefined
                                                        if (!nextProvider) {
                                                            return
                                                        }
                                                        const isLinked = linkedProviders[nextProvider as Provider]
                                                        if (isLinked) {
                                                            setLocalChart({data: {srcProvider: nextProvider}})
                                                        } else {
                                                            // Open up modal to link account
                                                            linkedAccountsModalDisclosureProps.onOpen()
                                                        }
                                                    }}
                                            >
                                                {Object.values(dataTypeTabs).map((type) => (
                                                    <SelectItem key={type.id} value={type.id} endContent={type.unlinked ?
                                                        <Chip classNames={{content: "font-medium text-white"}} size="sm"
                                                              color="success">Click to link</Chip> : undefined}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            <Input value={localMergedChart?.data?.srcUrl ?? ""}
                                                   onValueChange={(value) => setLocalChart({data: {srcUrl: value}})}
                                                   isClearable
                                                   label="Sheet URL"
                                                   isDisabled={isDemoDashboard}
                                                   labelPlacement="outside"
                                                   size="md"
                                                   radius="sm" type="text"
                                                   classNames={{
                                                       inputWrapper: "shadow-none"
                                                   }}
                                                   placeholder="i.e., 'https://onedrive.live.com/edit.aspx?resid={RES_ID}&cid={C_ID}&CT={CT}"
                                                   description={`ID: ${parsedWorkbookId || '<empty>'}`}
                                            />
                                            <Input value={localMergedChart?.data?.dataRange}
                                                   onValueChange={(value) => setLocalChart({data: {dataRange: value}})}
                                                   isClearable
                                                   label="Cell range"
                                                   labelPlacement="outside"
                                                   isDisabled={isDemoDashboard}
                                                   size="md"
                                                   radius="sm" type="text"
                                                   classNames={{
                                                       inputWrapper: "shadow-none"
                                                   }}
                                                   placeholder="i.e., 'Sheet1'!A1:B17"
                                                   description={`Worksheet: ${parsedRange.sheet ?? '<empty>'}, Range: ${parsedRange.range ?? '<empty>'}`}
                                            />
                                            <Button
                                                className="font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                                startContent={dataLoading ? null : !syncable ?
                                                    <MdOutlineWarningAmber className="text-xl"/> : synced ?
                                                        <MdOutlineCheck className="text-xl"/> :
                                                        <MdOutlineSync className="text-xl"/>}
                                                color={!syncable ? "danger" : synced ? "default" : "primary"}
                                                isLoading={dataLoading}
                                                disabled={isDemoDashboard || !(!synced && syncable)}
                                                onClick={() => {
                                                    fetchData({})
                                                }}>
                                                {isDemoDashboard ? "Using demo data" : !syncable ? "Check data setup" : synced ? "Up to date" : "Sync"}
                                            </Button>
                                            <Divider/>
                                            <h2 className="text-lg font-bold">Chart</h2>
                                            <Select placeholder="Chart type" aria-label="Chart type"
                                                    labelPlacement="outside" label="Chart type"
                                                    startContent={<ThisChartIcon className="text-lg"/>}
                                                    selectedKeys={new Set(localMergedChart?.data?.type ? [String(localMergedChart.data.type)] : [])}
                                                    onSelectionChange={(keys) => {
                                                        setLocalChart({data: {type: Array.from(keys)?.[0] ? String(Array.from(keys)[0]) as ChartPresetType : undefined}})
                                                    }}
                                            >
                                                {Object.values(graphTypeTabs).map((type) => (
                                                    <SelectItem key={type.id} value={type.id}
                                                                startContent={<type.Icon className="text-lg"/>}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            <div className="flex-col gap-3 sm:flex hidden">
                                                {renderChartInputFields()}
                                            </div>
                                        </div>
                                        <div
                                            className="sm:absolute overflow-hidden flex flex-col w-full h-[500px] sm:h-[calc(100%-7rem)] sm:w-[calc(66%-2.75rem)] right-8 top-6 bottom-6 p-2 bg-default-100 rounded-large">
                                            <Tabs
                                                fullWidth
                                                aria-label="Data Table"
                                                selectedKey={dataTableTab}
                                                onSelectionChange={(nextTab) => setDataTableTab(nextTab as PanelTab)}
                                                classNames={{panel: "px-1 py-1.5 h-full"}}
                                            >
                                                <Tab key={PanelTab.Chart} title="Chart">
                                                    <Suspense fallback={<Spinner/>}>
                                                        <Chart props={props}/>
                                                    </Suspense>
                                                </Tab>
                                                <Tab key={PanelTab.PreviewData} title="Data">
                                                    {data ? (
                                                        <Table aria-label="Data Preview Table" shadow="none">
                                                            <TableHeader className="rounded-none">
                                                                {data.values?.[0]?.map((column: string | number, columnIndex: number) =>
                                                                    <TableColumn className="uppercase"
                                                                                 key={columnIndex}>{column}</TableColumn>) ?? <>
                                                                    <TableColumn>Data</TableColumn></>}
                                                            </TableHeader>
                                                            <TableBody emptyContent={"No rows to display."}>
                                                                {data.values?.slice(1, 6)?.map((row: (string | number)[], rowIndex: number) => (
                                                                    <TableRow key={rowIndex}>
                                                                        {row.map((cell, cellIndex) => <TableCell
                                                                            key={cellIndex}>{cell}</TableCell>)}
                                                                    </TableRow>
                                                                )) ?? []}
                                                            </TableBody>
                                                        </Table>
                                                    ) : (
                                                        <Table hideHeader aria-label="Data Preview Table" shadow="none">
                                                            <TableHeader className="rounded-none">
                                                                <TableColumn>DATA</TableColumn>
                                                            </TableHeader>
                                                            <TableBody emptyContent={"No rows to display."}>
                                                                {[]}
                                                            </TableBody>
                                                        </Table>
                                                    )}
                                                </Tab>
                                                <Tab key={PanelTab.ExpectedData} title="Expected Format">
                                                    <div
                                                        className="text-tiny justify-center w-full flex text-foreground-400 pb-1.5">
                                                        Showing expected shape of data for
                                                        a {graphTypeTabs[localMergedChart.data.type].label} chart.
                                                    </div>
                                                    <Table aria-label="Expected Data Table" shadow="none">
                                                        <TableHeader className="rounded-none">
                                                            {graphTypeTabs[localMergedChart.data.type].expectedData[0].map((column: string | number, columnIndex: number) =>
                                                                <TableColumn className="uppercase"
                                                                             key={columnIndex}>{column}</TableColumn>) ?? <>
                                                                <TableColumn>Data</TableColumn></>}
                                                        </TableHeader>
                                                        <TableBody emptyContent={"No rows to display."}>
                                                            {graphTypeTabs[localMergedChart.data.type].expectedData.slice(1).map((row: (string | number)[], rowIndex: number) => (
                                                                <TableRow key={rowIndex}>
                                                                    {row.map((cell, cellIndex) => <TableCell
                                                                        key={cellIndex}>{cell}</TableCell>)}
                                                                </TableRow>
                                                            )) ?? []}
                                                        </TableBody>
                                                    </Table>
                                                </Tab>
                                            </Tabs>
                                        </div>
                                        <div className="flex-col gap-3 sm:hidden flex">
                                            {renderChartInputFields()}
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <Divider/>
                            <ModalFooter className="flex flex-row items-center justify-between">
                                <div className="flex flex-row items-center">
                                    {!isNew && (
                                        <Button color="danger" variant="light" isIconOnly onPress={() => {
                                            if (chartLoading) {
                                                return
                                            }
                                            if (confirm('Are you sure you want to delete this chart?')) {
                                                deleteThisChart({})
                                            } else {
                                                // Do nothing!
                                            }
                                        }}>
                                            <RxTrash className="text-xl"/>
                                        </Button>
                                    )}
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button className="font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                            color="primary" onPress={() => !isDemoDashboard && synced && syncable && saveThisChart()}
                                            isLoading={chartLoading}
                                            disabled={isDemoDashboard || !(synced && syncable)}>
                                        {isDemoDashboard ? "Save disabled in demo mode" : `Save${isNew ? "" : " changes"}`}
                                    </Button>
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <LinkedAccountsModal {...linkedAccountsModalDisclosureProps}/>
        </>
    )
}