export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="font-display text-4xl tracking-tight text-lsd-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose max-w-none space-y-4 text-lsd-gray-600 text-sm leading-relaxed">
        <p>LSD — Like Something Dope ("we", "us") respects your privacy. This policy explains what data we collect and how we use it.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Information We Collect</h2>
        <p>When you create an account, we store your name, email, and phone number. When you place an order, we store your delivery address and order details.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">How We Use Your Data</h2>
        <p>We use your information to process orders, provide order tracking, and improve our service. We do not sell your data to third parties.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Data Security</h2>
        <p>All data is stored securely using Supabase with row-level security policies ensuring only you can access your own data.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Contact</h2>
        <p>For privacy questions, reach us at the restaurant in Okhla, Jamia Nagar, New Delhi.</p>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="font-display text-4xl tracking-tight text-lsd-gray-900 mb-6">Terms & Conditions</h1>
      <div className="prose max-w-none space-y-4 text-lsd-gray-600 text-sm leading-relaxed">
        <p>By using the LSD website and placing an order, you agree to these terms.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Orders</h2>
        <p>All orders are subject to availability and confirmation. Prices are subject to change. Delivery charges and minimum order amounts may apply.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Payment</h2>
        <p>We accept cash on delivery and online payment. Payment must be completed before delivery for online orders.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Delivery</h2>
        <p>Estimated delivery times are approximate. We are not liable for delays outside our control.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Cancellations</h2>
        <p>Orders can be cancelled before preparation begins. Once preparation starts, cancellation may not be possible.</p>
        <h2 className="font-bold text-lsd-gray-900 text-lg">Contact</h2>
        <p>For any questions about these terms, visit us in Okhla, Jamia Nagar, New Delhi.</p>
      </div>
    </div>
  );
}
