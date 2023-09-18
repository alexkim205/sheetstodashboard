import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLIC_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient;

function createSupabaseClient(): SupabaseClient {
    if (!URL || !PUBLIC_ANON_KEY) {
        const message = "Error: Supabase environment variables aren't set!";
        console.error(message);
        throw new Error(message);
    }

    if (!client) {
        client = createClient(URL, PUBLIC_ANON_KEY);
    }

    return client;
}

const supabase = createSupabaseClient();

export default supabase;
