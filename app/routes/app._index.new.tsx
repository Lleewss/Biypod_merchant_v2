import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { BiypodCard } from "../components/ui/BiypodCard";
import { BiypodButton } from "../components/ui/BiypodButton";
import { authenticate } from "../shopify.server";
import { requireActiveSubscription } from "../lib/billing/plan-gating.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const { shop: shopDomain } = session;

  // Enforce plan gating - redirect to plan selection if no active subscription
  const subscription = await requireActiveSubscription(shopDomain, new URL(request.url).pathname);

  // Get basic shop info
  const response = await admin.graphql(`
    query {
      shop {
        name
        email
        myshopifyDomain
        plan {
          displayName
        }
      }
    }
  `);

  const { data } = await response.json();
  const { shop } = data;

  return { shop, subscription };
};

export default function Dashboard() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <TitleBar title="Dashboard" />

      {/* Welcome Section */}
      <BiypodCard className="bg-gradient-secondary text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome to Biypod, {shop.name}!
          </h1>
          <p className="text-blue-100 mb-4">
            Transform your products with our powerful 3D customization platform
          </p>
          <BiypodButton variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            Get Started
          </BiypodButton>
        </div>
      </BiypodCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BiypodCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-gray-600">Custom Products</div>
          </div>
        </BiypodCard>

        <BiypodCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-gray-600">Active Designs</div>
          </div>
        </BiypodCard>

        <BiypodCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <div className="text-gray-600">Orders This Month</div>
          </div>
        </BiypodCard>
      </div>

      {/* Quick Actions */}
      <BiypodCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                +
              </div>
              <span>Create Product</span>
            </BiypodButton>

            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                🎨
              </div>
              <span>Design Studio</span>
            </BiypodButton>

            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                📊
              </div>
              <span>Analytics</span>
            </BiypodButton>

            <BiypodButton variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
                ⚙️
              </div>
              <span>Settings</span>
            </BiypodButton>
          </div>
        </div>
      </BiypodCard>

      {/* Shop Info */}
      <BiypodCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Shop Name:</span>
              <span className="ml-2 text-gray-900">{shop.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Domain:</span>
              <span className="ml-2 text-gray-900">{shop.myshopifyDomain}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{shop.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Plan:</span>
              <span className="ml-2 text-gray-900">{shop.plan.displayName}</span>
            </div>
          </div>
        </div>
      </BiypodCard>
    </div>
  );
}
