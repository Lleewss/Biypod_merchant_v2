import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  
  // If this is a request from Shopify admin, redirect to the app route
  const referer = request.headers.get("referer");
  if (referer && referer.includes("admin.shopify.com")) {
    return redirect("/app" + url.search);
  }
  
  // If there's a shop parameter, redirect to app
  if (url.searchParams.get("shop")) {
    return redirect("/app" + url.search);
  }
  
  // Otherwise redirect to the main index
  return redirect("/" + url.search);
};

export default function CatchAll() {
  return null;
}
