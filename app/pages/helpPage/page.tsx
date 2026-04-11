export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto p-6  space-y-8">
      <h1 className="text-3xl font-mono font-bold">Help Center</h1>

      {/* Introduction */}
      <section>
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p className="text-gray-600">
          The Shop Management System helps you manage products, record sales,
          track inventory, and generate reports. This guide explains how to use
          each feature of the system.
        </p>
      </section>

      {/* Products */}
      <section>
        <h2 className="text-xl font-semibold mb-2">2. Managing Products</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Go to the <b>Products</b> section from the sidebar.</li>
          <li>Click <b>Add Product</b> to create a new product.</li>
          <li>Enter product name, price, and quantity.</li>
          <li>Use the edit button to update product details.</li>
          <li>Delete products if they are no longer needed.</li>
        </ul>
      </section>

      {/* Sales */}
      <section>
        <h2 className="text-xl font-semibold mb-2">3. Recording Sales</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Navigate to the <b>Sales</b> page.</li>
          <li>Select the product being sold.</li>
          <li>Enter the quantity sold.</li>
          <li>Select the payment method (Cash, online, etc).</li>
          <li>The system will automatically calculate the total price.</li>
        </ul>
      </section>

      {/* Reports */}
      <section>
        <h2 className="text-xl font-semibold mb-2">4. Viewing Reports</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Open the <b>Reports</b> section.</li>
          <li>Select a date range.</li>
          <li>Click <b>Download Report</b> to generate a PDF.</li>
          <li>The report will contain all sales within the selected period.</li>
        </ul>
      </section>

      {/* Users */}
      <section>
        <h2 className="text-xl font-semibold mb-2">5. User Management</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Admins can add or remove users.</li>
          <li>Users can have roles like Admin or Staff.</li>
          <li>Each user can access the system using their login credentials.</li>
        </ul>
      </section>

      {/* Password */}
      <section>
        <h2 className="text-xl font-semibold mb-2">6. Changing Password</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>Go to the <b>Settings</b> page.</li>
          <li>Click <b>Change Password</b>.</li>
          <li>Enter your current password.</li>
          <li>Enter your new password and confirm it.</li>
        </ul>
      </section>

      {/* Troubleshooting */}
      <section>
        <h2 className="text-xl font-semibold mb-2">7. Troubleshooting</h2>
        <ul className="list-disc pl-6 text-gray-600">
          <li>If a product cannot be sold, check if stock is available.</li>
          <li>If reports fail to download, refresh the page.</li>
          <li>Make sure you are connected to the internet.</li>
        </ul>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xl font-semibold mb-2">8. Contact Support</h2>
        <p className="text-gray-600">
          If you experience issues with the system, please contact the system
          administrator or technical support.
        </p>
      </section>
    </div>
  );
}