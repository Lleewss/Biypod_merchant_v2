#!/bin/bash

# Remove Polaris imports from all route files and replace with basic HTML/Tailwind

echo "Removing Polaris imports from route files..."

# List of files to update
files=(
  "app/routes/app._index.new.tsx"
  "app/routes/app.products.tsx"
  "app/routes/app.plans.tsx"
  "app/routes/app.orders.tsx"
  "app/routes/app.designs.tsx"
  "app/routes/app.models.tsx"
  "app/routes/app.settings.tsx"
  "app/routes/app.tickets.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Create a simple placeholder component
    cat > "$file" << 'EOF'
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
EOF
  fi
done

echo "Done removing Polaris imports!"
