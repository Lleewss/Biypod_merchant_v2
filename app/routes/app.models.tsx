import { TitleBar } from "@shopify/app-bridge-react";
import { BiypodCard } from "../components/ui/BiypodCard";

export default function Page() {
  return (
    <div className="space-y-6">
      <TitleBar title="Page" />
      <BiypodCard>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600">
            This page is under development.
          </p>
        </div>
      </BiypodCard>
    </div>
  );
}
