import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Privacy Policy</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">Personal Information</h3>
                  <p className="text-gray-700">
                    When you use our recruitment platform, we may collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Name and email address (via Google OAuth)</li>
                    <li>Profile information from your Google account</li>
                    <li>Resume data and job application information</li>
                    <li>Usage analytics and platform interaction data</li>
                    <li>Communication preferences and settings</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    We use the collected information to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Provide and improve our recruitment services</li>
                    <li>Process and rank resumes using AI technology</li>
                    <li>Send important service updates and notifications</li>
                    <li>Analyze platform usage to enhance user experience</li>
                    <li>Ensure platform security and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Security</h2>
                <p className="text-gray-700">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication via Google OAuth</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and employee training</li>
                  <li>Secure cloud infrastructure (Supabase)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
                <p className="text-gray-700">
                  We do not sell, trade, or rent your personal information to third parties. We may share information only in these circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements</li>
                  <li>With service providers who assist our operations (under strict confidentiality)</li>
                  <li>In case of business transfers (with notice)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                <p className="text-gray-700">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                <p className="text-gray-700">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li>Remember your login status</li>
                  <li>Analyze platform usage</li>
                  <li>Improve user experience</li>
                  <li>Ensure platform security</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
                <p className="text-gray-700">
                  Our platform integrates with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li><strong>Google OAuth:</strong> For secure authentication</li>
                  <li><strong>Supabase:</strong> For secure data storage and management</li>
                  <li><strong>AI Services:</strong> For resume analysis and ranking</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  These services have their own privacy policies, which we encourage you to review.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
                <p className="text-gray-700">
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will remove your personal data within 30 days, except where retention is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
                <p className="text-gray-700">
                  Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our service after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="text-gray-700">
                  If you have any questions about this privacy policy or our data practices, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@recruitassistant.com<br />
                    <strong>Address:</strong> [Your Company Address]<br />
                    <strong>Phone:</strong> [Your Contact Number]
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
