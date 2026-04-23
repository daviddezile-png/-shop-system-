import {
  Book,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  HelpCircle,
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <HelpCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help Center
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your comprehensive guide to mastering the Shop Management System.
            Find everything you need to run your business efficiently.
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Products
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Manage your inventory with ease. Add, edit, and track products
              efficiently.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Navigate to <strong>Products</strong> from the sidebar menu
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Click <strong>Add Product</strong> to create new items
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Enter product details: name, price, quantity, category
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Use edit/delete buttons to manage existing products</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Sales
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Record transactions quickly and keep track of your revenue
              streams.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Go to <strong>Sales</strong> page from the navigation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Select the product and enter quantity sold</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Choose payment method: Cash or Online</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>System automatically calculates total price</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Reports
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Generate comprehensive reports to analyze your business
              performance.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Access <strong>Reports</strong> section from sidebar
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Select your preferred date range</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Click <strong>Download Report</strong> to generate PDF
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Reports include all sales data within selected period
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                User Management
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Control access and permissions for your team members.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Admins can add, edit, and remove users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Assign roles: Admin or Staff</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Each user gets unique login credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Manage user permissions and access levels</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Settings className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Account Settings
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Personalize your account and maintain security.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Click your profile in the sidebar footer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  Select <strong>Change Password</strong> from menu
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Enter current password for verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Set and confirm your new password</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Troubleshooting
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Quick solutions to common issues you might encounter.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  <strong>Product not selling?</strong> Check stock availability
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  <strong>Report download failed?</strong> Refresh the page and
                  retry
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  <strong>Can&apos;t login?</strong> Verify credentials and
                  connection
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>
                  <strong>Slow performance?</strong> Clear browser cache
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="bg-gradient-to-r from-blue-950 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Need More Help?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Our support team is here to assist you with any questions or
              issues you might have. Don&apos;t hesitate to reach out!
            </p>
            <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
              <div className="w-[300px] justify-center  flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <Phone className="w-5 h-5" />
                <span>+255 758 012 513</span>
              </div>
              <div className="w-[300px] justify-center flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <Mail className="w-5 h-5" />
                <span>support@shopmanagement.com</span>
              </div>
              <div className="w-[300px] justify-center flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <MessageSquare className="w-5 h-5" />
                <span>Live Chat Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Pro Tips
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                💡 Efficiency
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use keyboard shortcuts and date filters to navigate faster
                through the system.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                📊 Analytics
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check your dashboard regularly to monitor sales trends and
                inventory levels.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                🔒 Security
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Change your password regularly and never share your login
                credentials.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                📱 Mobile
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The system is fully responsive - use it on any device, anywhere!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
