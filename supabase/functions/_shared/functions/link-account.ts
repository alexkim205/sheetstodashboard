// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {corsHeaders} from "../cors.ts"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createUserSupabaseClient} from "../supabase.ts";


export async function linkAccount(body: Record<string, any>, headers: Headers) {
    const { from_email, to_email } = body

    if (from_email === to_email) {
        // If email addresses are the same, merging accounts is handled internally by Supabase
        return new Response(
            JSON.stringify({from_email, to_email}),
            {headers: corsHeaders},
        )
    }

    const supabaseClient = createUserSupabaseClient(headers.get('Authorization')!)
    // Now we can get the session or user object
    const {
        data: { user }, error: getUserError
    } = await supabaseClient.auth.getUser()

    if (getUserError) {
        return new Response(JSON.stringify({error: getUserError.message}), {
            headers: corsHeaders,
            status: 400,
        })
    }
    if (!user) {
        return new Response(JSON.stringify({error: `User with email ${from_email} does not exist.`}), {
            headers: corsHeaders,
            status: 400,
        })
    }

    if (user.email !== from_email) {
        return new Response(JSON.stringify({error: "User cannot add link for different account"}), {
            headers: corsHeaders,
            status: 400,
        })
    }

    // Add two link rows in both directions
    const { error } = await supabaseClient
        .from('linked_accounts')
        .insert([
            { from_email, to_email },
            { from_email: to_email, to_email: from_email }
        ])
    if (error && error.code !== "23505") {
        return new Response(JSON.stringify({error: error.message}), {
            headers: corsHeaders,
            status: 400,
        })
    }

    return new Response(
        JSON.stringify({from_email, to_email}),
        {headers: corsHeaders},
    )
}