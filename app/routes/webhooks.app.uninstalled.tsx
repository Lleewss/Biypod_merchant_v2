import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // With memory session storage, sessions are automatically cleaned up
  // No database cleanup needed for sessions
  console.log(`App uninstalled for shop: ${shop}`);

  return new Response();
};
