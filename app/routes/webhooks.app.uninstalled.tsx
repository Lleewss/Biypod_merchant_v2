import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    // TODO: Clean up shop data when app is uninstalled
    // - Remove shop sessions
    // - Cancel active subscriptions
    // - Clean up shop-specific data
    console.log(`App uninstalled for shop: ${shop}`);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing app/uninstalled webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
