// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {corsHeaders} from "../cors.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createStripeClient} from "../stripe.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {combineUrl} from "kea-router";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const IS_PRODUCTION = Deno.env.get('VERCEL_ENV') === 'production'

// https://dashboard.stripe.com/products?active=true
const PRODUCT_TO_ID: Record<string, string> = IS_PRODUCTION ? {
    tiny: 'price_1Nue7kKQM0RYeWU9mBMteHnj',
    small: 'price_1NueKNKQM0RYeWU9V6DCe6EY',
    mega: 'price_1NueKgKQM0RYeWU9XSkEDtwi',
    life: 'price_1O1kBvKQM0RYeWU9CypWkwMn',
} : {
    tiny: 'price_1NueZXKQM0RYeWU9QxMJGWvW',
    small: 'price_1NueZfKQM0RYeWU9TDa7SB86',
    mega: 'price_1NueZuKQM0RYeWU9cSGZmNdj',
    life: 'price_1O1kBhKQM0RYeWU99XbCIeEU',
}

export async function createPaymentLink(body: Record<string, any>) {
    const {plan, user, redirectUrl} = body
    const stripe = createStripeClient()

    if (!Object.keys(PRODUCT_TO_ID).includes(plan) || !user) {
        return new Response(JSON.stringify({error: "Invalid plan or user."}), {
            headers: corsHeaders,
            status: 400,
        })
    }

    let paymentLink
    try {
        paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: PRODUCT_TO_ID[plan] as string,
                    quantity: 1,
                },
            ],
            metadata: {
                user,
                plan
            },
            ...(plan === "life" ? {} : {
                subscription_data: {
                    description: user // sneak in user id into subscription data
                },
            }),
            allow_promotion_codes: true,
            after_completion: {
                type: "redirect",
                redirect: {
                    url: combineUrl(redirectUrl, {
                        success: true
                    }).url
                }
            }
        });
    } catch (e) {
        const error = e as unknown as Error
        return new Response(JSON.stringify({error: error.message}), {
            headers: corsHeaders,
            status: 400,
        })
    }

    return new Response(
        JSON.stringify({
            paymentLink
        }),
        { headers: corsHeaders },
    )
}