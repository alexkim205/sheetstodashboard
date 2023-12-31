import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader, Chip, Code,
    Divider,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalContent, ModalFooter,
    ModalHeader,
} from "@nextui-org/react";
import {useActions, useValues} from "kea";
import {publishModalLogic} from "../../logics/publishModalLogic";
import {PricingTier, PublishStatus} from "../../utils/types";
import {TbLayoutGrid, TbMessageQuestion, TbStar, TbWorldWww} from "react-icons/tb";
import {capitalizeFirstLetter} from "kea-forms/lib/utils";
import {userLogic} from "../../logics/userLogic";
import {TierPerks} from "../TierPerks";
import {dashboardLogic, DashboardLogicProps} from "../../logics/dashboardLogic";
import {RxClipboard} from "react-icons/rx";
import useCopy from "@react-hook/copy";
import {toast} from "react-toastify";
import {useState} from "react";
import {pricingLogic} from "../../logics/pricingLogic";
import {A} from "kea-router";
import {urls} from "../../utils/routes";

export interface PublishModalProps {
    props: DashboardLogicProps
}

export const TIERS = [
    {
        value: PricingTier.Free,
        price: 0,
        perks: [
            {
                Icon: TbLayoutGrid,
                label: "Unlimited personal offline dashboards"
            },
        ]
    },
    {
        value: PricingTier.Tiny,
        price: 5,
        perks: [
            {
                Icon: TbLayoutGrid,
                label: "Up to 5 shareable dashboards"
            },
            {
                Icon: TbWorldWww,
                label: "Custom domain"
            },
        ]
    },
    {
        value: PricingTier.Small,
        price: 10,
        perks: [
            {
                Icon: TbLayoutGrid,
                label: "Up to 15 shareable dashboards"
            },
            {
                Icon: TbWorldWww,
                label: "Custom domain"
            },
        ]
    },
    {
        value: PricingTier.Mega,
        price: 20,
        perks: [
            {
                Icon: TbLayoutGrid,
                label: "Unlimited shareable dashboards"
            },
            {
                Icon: TbWorldWww,
                label: "Custom domain"
            },
            {
                Icon: TbMessageQuestion,
                label: "Priority support"
            },
        ]
    }
]

export const TIERS_WITH_LIFE = [...TIERS, {
    value: PricingTier.Life,
    price: 0,
    perks: [
        {
            Icon: TbStar,
            label: "Thank you for being one of the first adopters! You have lifetime access to all future updates of Sheets to Dashboard."
        },
        {
            Icon: TbLayoutGrid,
            label: "Unlimited shareable dashboards"
        },
        {
            Icon: TbWorldWww,
            label: "Custom domain"
        },
        {
            Icon: TbMessageQuestion,
            label: "Priority support"
        },
    ]
},]

export function PublishModal({props}: PublishModalProps) {
    const logic = publishModalLogic(props)
    const {plan} = useValues(userLogic)
    const {open} = useValues(logic)
    const {setOpen} = useActions(logic)

    return (
        <Modal size={plan === PricingTier.Free ? "3xl" : "md"} isOpen={open} onClose={() => setOpen(false)}
               scrollBehavior="inside">
            <ModalContent>
                {() => plan === PricingTier.Free ? (
                    <>
                        <ModalHeader className="flex-col items-center justify-center">
                            <h3 className="text-2xl font-bold">Pricing and Why</h3>
                        </ModalHeader>
                        <Divider/>
                        <ModalBody>
                            <PaywallBlurb/>
                            <PaywallTiers/>
                        </ModalBody>
                    </>
                ) : (
                    <PublishModalSettings props={props}/>
                )}
            </ModalContent>
        </Modal>
    )
}

export function PaywallBlurb() {
    return (
        <div className="flex flex-col gap-4 leading-relaxed">
            <p className="font-normal mb-2">Hi 👋 this is Alex, the solo founder of Sheets to
                Dashboard. I initially made this product to solve a problem I was running into, and was
                floored by the positive feedback I got when I released the beta. At the end of the day, I'd like to keep
                this product free, however with server/api/data/domain/email costs (and my own bills to
                pay 🫠), I cannot sustain this product and its growth if it remains entirely free.</p>
            <p className="font-normal mb-2"><span className="font-semibold">There are paid tiers, but there will always be a freemium
                                tier for Sheets to Dashboard</span>, which at its bare minimum lets you create an
                unlimited amount of offline
                dashboards for your personal use. If you pay for a license, you can publish your
                dashboards to your own custom domain or a subdomain like abc.sheetstodashboard.com.
                Plus, it comes with other features you might find helpful. And of course, if you are a
                non-profit or current student, shoot me an email at
                <Link size="md" className="mx-1"
                      href="mailto:hellosimplelanding@gmail.com">hellosimplelanding@gmail.com</Link>
                with details for a discounted license.</p>
            <p>Thank you for supporting this product. Looking forward
                to hearing your feedback and making a great product! :)</p>
        </div>
    )
}

export function PaywallTiers() {
    const {loadingPaymentLinkPricingTier} = useValues(pricingLogic)
    const {generatePaymentLink} = useActions(pricingLogic)
    const {user} = useValues(userLogic)

    return (
        <>
            {/* TODO: Remove once lifetime deal is over */}
            <Card key="lifetime" shadow="none" className="w-full shrink-0 border-medium mb-3 p-2 gap-3"
                  classNames={{body: "p-0", footer: "p-0"}}>
                <CardHeader
                    className="text-2xl flex flex-col gap-2 font-bold text-center justify-center bg-warning py-5 px-3 rounded-medium">
                    Limited Lifetime Deal
                    <div className="flex flex-row gap-1 text-2xl">
                        One time $20 payment
                    </div>
                </CardHeader>
                <CardBody>
                    <TierPerks perks={[
                        {
                            Icon: TbLayoutGrid,
                            label: "Unlimited shareable dashboards"
                        },
                        {
                            Icon: TbWorldWww,
                            label: "Custom domain"
                        },
                        {
                            Icon: TbMessageQuestion,
                            label: "Priority support"
                        },
                    ]}/>
                </CardBody>
                <CardFooter>
                    {!user ? (
                        <Button
                            as={A}
                            href={urls.sign_up()}
                            radius="md"
                            className="text-base font-medium disabled:opacity-50"
                            color="warning"
                            fullWidth size="lg"
                        >
                            Sign up
                        </Button>
                    ) : (
                        <Button
                            radius="md"
                            className="text-base font-medium disabled:opacity-50"
                            color="warning"
                            fullWidth size="lg"
                            onPress={() => {
                                generatePaymentLink(PricingTier.Life)
                            }}
                        >
                            Pay once
                        </Button>
                    )}
                </CardFooter>
            </Card>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
                {TIERS.map(({value, price, perks}) => (
                    <Card key={value} shadow="none" className="w-full border-medium p-2 gap-3"
                          classNames={{body: "p-0", footer: "p-0"}}>
                        <CardHeader
                            className="text-2xl flex flex-col gap-2 font-bold text-center justify-center bg-primary-500 py-5 px-3 text-white rounded-medium">
                            {capitalizeFirstLetter(value)}
                            <div className="flex flex-row gap-1 text-4xl">
                                <span className="text-lg self-start">$</span>{price}
                                <div className="flex flex-col justify-start items-start">
                                    <span className="text-sm">per</span>
                                    <span className="text-sm -mt-1">mo</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <TierPerks perks={perks}/>
                        </CardBody>
                        <CardFooter>
                            {value === PricingTier.Free ? (
                                <Button variant="faded" radius="md" disabled
                                        className="disabled:opacity-50 text-base font-medium"
                                        color="primary"
                                        fullWidth size="lg">
                                    Current plan
                                </Button>
                            ) : !user ? (
                                <Button
                                    as={A}
                                    href={urls.sign_up()}
                                    radius="md"
                                    className="text-base font-medium disabled:opacity-50"
                                    color="primary"
                                    fullWidth size="lg"
                                >
                                    Sign up
                                </Button>
                            ) : (
                                <Button
                                    radius="md"
                                    className="text-base font-medium disabled:opacity-50"
                                    color="primary"
                                    fullWidth size="lg"
                                    disabled={value === loadingPaymentLinkPricingTier}
                                    isLoading={value === loadingPaymentLinkPricingTier}
                                    onPress={() => {
                                        generatePaymentLink(value)
                                    }}
                                >
                                    Subscribe
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    )
}

export function PublishModalSettings({props}: PublishModalProps) {
    const publishLogic = publishModalLogic(props)
    const logic = dashboardLogic(props)
    const {publishDomainLoading, publishDomain, publishable} = useValues(publishLogic)
    const {addDomainToProject, setPublishDomain} = useActions(publishLogic)
    const {dashboard, publishStatus, publishStatusLoading} = useValues(logic)
    const [showInstructions, setShowInstructions] = useState(false)
    const formattedDefaultDomain = dashboard?.subdomain ? `${dashboard.subdomain}.sheetstodashboard.com` : ""

    const {copy: defaultCopy} = useCopy(
        formattedDefaultDomain
    )
    const {copy: customCopy} = useCopy(
        dashboard?.custom_domain ?? ""
    )

    return (
        <>
            <ModalHeader className="flex-col items-center justify-center">
                <h3 className="text-2xl font-bold">Publish Dashboard</h3>
            </ModalHeader>
            <Divider className="mb-2"/>
            <ModalBody className="flex flex-col">
                <h2 className="text-lg font-bold">Domains</h2>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex flex-row justify-between items-end">
                            <label className="font-medium text-sm">Custom domain</label>
                            <Chip
                                color={publishStatusLoading ? "default" : publishStatus === PublishStatus.Online ? "success" : "danger"}
                                classNames={{content: "font-semibold text-white"}} size="sm"
                                variant="solid">{capitalizeFirstLetter(publishStatus)}</Chip>
                        </div>
                        <Input value={publishDomain}
                               onValueChange={(nextDomain) => setPublishDomain(nextDomain)}
                               size="md"
                               radius="sm" type="text"
                               placeholder="yourdomain.com"
                               classNames={{
                                   inputWrapper: "shadow-none overflow-hidden pl-unit-4 pr-0"
                               }}
                               endContent={<Button variant="flat" radius="none"
                                                   className="bg-default-200 rounded-r-sm w-[56px] border-default-200"
                                                   isIconOnly onPress={async () => {
                                   await customCopy()
                                   toast.success("Copied to clipboard.")
                               }}>
                                   <RxClipboard className="text-lg shrink-0"/>
                               </Button>}
                        />
                        <Accordion className="p-0" variant="light" isCompact
                                   selectedKeys={new Set(showInstructions ? ["1"] : [])}
                                   onSelectionChange={(newSet) => Array.from(newSet).includes("1") ? setShowInstructions(true) : setShowInstructions(false)}>
                            <AccordionItem key="1" aria-label="Custom domain instructions"
                                           title={showInstructions ? "Hide instructions" : "Show instructions"}
                                           classNames={{title: "text-xs text-default-400", trigger: "p-0"}}
                                           className="text-sm flex flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                    <p>Add the following DNS records to connect your custom domain to your
                                        SheetsToDashboard
                                        site.</p>
                                    <p>To have your site on a root domain (like <Code>yoursite.com</Code>):</p>
                                    <ul className="list-disc list-outside pl-4">
                                        <li>Add a <Code>A</Code> record pointing to <Code>76.76.21.21</Code>.
                                        </li>
                                        <li>Add a <Code>CNAME</Code> record for www pointing
                                            to <Code>sheetstodashboard.com</Code>.
                                        </li>
                                    </ul>
                                    <p> To have your site on a subdomain (like <Code>subdomain.yoursite.com</Code> ):
                                    </p>
                                    <ul className="list-disc list-outside pl-4">
                                        <li>
                                            Add a <Code>CNAME</Code> record for subdomain (or whatever you wish)
                                            pointing to <Code>sheetstodashboard.com</Code>.
                                        </li>
                                    </ul>
                                </div>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex flex-row justify-between items-end">
                            <label className="font-medium text-sm">Default domain</label>
                            <Chip color="success" classNames={{content: "font-semibold text-white"}} size="sm"
                                  variant="solid">{capitalizeFirstLetter(PublishStatus.Online)}</Chip>
                        </div>
                        <Button onPress={async () => {
                            if (!dashboard?.subdomain) {
                                return
                            }
                            await defaultCopy()
                            toast.success("Copied to clipboard.")
                        }} color="default" variant="flat" radius="sm" size="md"
                                className="justify-between"
                                endContent={dashboard?.subdomain && <RxClipboard className="text-lg"/>}>
                            {dashboard?.subdomain ? (`${dashboard.subdomain}.sheetstodashboard.com`) : ("")}
                        </Button>
                        <p className="text-default-400 text-xs">This dashboard will always be available on this
                            secondary subdomain provided by us.</p>
                    </div>
                </div>
            </ModalBody>
            <Divider className="mt-2"/>
            <ModalFooter>
                <Button
                    isLoading={publishDomainLoading}
                    isDisabled={!publishable}
                    className="disabled:opacity-50"
                    color="primary"
                    onPress={() => addDomainToProject()}
                >
                    {publishable ? "Save and publish" : "Published"}
                </Button>
            </ModalFooter>
        </>
    )
}