import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  
  return json({
    environment: {
      SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? "SET" : "MISSING",
      SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? "SET" : "MISSING",
      SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || "MISSING",
      SCOPES: process.env.SCOPES || "MISSING",
    },
    request: {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      searchParams: Object.fromEntries(url.searchParams.entries()),
    }
  });
};

export default function Debug() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.environment, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Request Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.request, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
