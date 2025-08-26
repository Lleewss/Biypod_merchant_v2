import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        const { payload, topic, shop } = await authenticate.webhook(request);
        console.log(`Received ${topic} webhook for ${shop}`);

        const current = payload.current as string[];
        console.log(`Scopes updated for ${shop}:`, current);

        // TODO: Handle scope changes if needed
        // - Update stored permissions
        // - Notify relevant systems

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("Error processing app/scopes_update webhook:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
