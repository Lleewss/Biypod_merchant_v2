import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { payload, topic, shop } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    const current = payload.current as string[];
    console.log(`Scopes updated for ${shop}:`, current);

    // With memory session storage, scopes are handled automatically
    // No database update needed
    return new Response();
};
