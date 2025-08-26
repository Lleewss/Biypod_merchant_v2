import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { BiypodLogo } from "../components/ui/BiypodLogo";
import { requireActiveSubscription } from "../lib/billing/plan-gating.server";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Enforce plan gating - redirect to plan selection if no active subscription
  const subscription = await requireActiveSubscription(shop, new URL(request.url).pathname);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    subscription
  };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      {/* App Bridge Navigation Menu */}
      <NavMenu>
        <Link to="/app" rel="home">
          Dashboard
        </Link>
        <Link to="/app/products">
          Products
        </Link>
        <Link to="/app/orders">
          Orders
        </Link>
        <Link to="/app/designs">
          Designs
        </Link>
        <Link to="/app/tickets">
          Tickets
        </Link>
        <Link to="/app/settings">
          Settings
        </Link>
      </NavMenu>

      <div className="min-h-screen bg-neutral-50">
        {/* Header with gradient */}
        <header className="bg-gradient-secondary text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <BiypodLogo variant="primary" color="white" className="h-8" />
              <div className="text-sm text-blue-100">
                Biypod 3D Customizer
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
