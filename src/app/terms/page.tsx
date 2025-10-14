import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Terms of Service</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing and using Recruit Assistant ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700">
                  Recruit Assistant is an AI-powered recruitment platform that helps users:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                  <li>Upload and manage resumes</li>
                  <li>Rank candidates using artificial intelligence</li>
                  <li>Streamline recruitment processes</li>
                  <li>Analyze job applications efficiently</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">Account Creation</h3>
                  <p className="text-gray-700">
                    To use our service, you must create an account using Google OAuth. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                    <li>Providing accurate and complete information</li>
                    <li>Maintaining the security of your account</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-gray-800 mt-6">Account Termination</h3>
                  <p className="text-gray-700">
                    We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our discretion.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">Permitted Uses</h3>
                  <p className="text-gray-700">You may use our service to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                    <li>Process legitimate job applications</li>
                    <li>Manage recruitment workflows</li>
                    <li>Analyze candidate data for hiring purposes</li>
                    <li>Improve your recruitment processes</li>
                  </ul>

                  <h3 className="text-xl font-medium text-gray-800 mt-6">Prohibited Uses</h3>
                  <p className="text-gray-700">You may not use our service to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                    <li>Upload false or misleading information</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use the service for discriminatory hiring practices</li>
                    <li>Spam or send unsolicited communications</li>
                    <li>Reverse engineer or attempt to extract source code</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">Our Rights</h3>
                  <p className="text-gray-700">
                    The service and its original content, features, and functionality are owned by Recruit Assistant and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  
                  <h3 className="text-xl font-medium text-gray-800 mt-6">Your Content</h3>
                  <p className="text-gray-700">
                    You retain ownership of any content you upload to our service. By uploading content, you grant us a limited license to use, process, and analyze your content solely for the purpose of providing our services to you.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
                <p className="text-gray-700">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference. By using our service, you consent to the collection and use of information as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h2>
                <p className="text-gray-700">
                  We strive to provide continuous service availability, but we do not guarantee that the service will be uninterrupted or error-free. We may temporarily suspend the service for maintenance, updates, or other reasons. We will provide reasonable notice when possible.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">Service Disclaimer</h3>
                  <p className="text-gray-700">
                    The service is provided "as is" without warranties of any kind, either express or implied. We disclaim all warranties, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                    <li>Warranties of merchantability and fitness for a particular purpose</li>
                    <li>Warranties regarding the accuracy or reliability of AI-generated rankings</li>
                    <li>Warranties that the service will meet your requirements</li>
                    <li>Warranties regarding the security of data transmission</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium text-gray-800 mt-6">AI Disclaimer</h3>
                  <p className="text-gray-700">
                    Our AI-powered features are designed to assist in recruitment processes but should not be the sole basis for hiring decisions. Users are responsible for making final hiring decisions based on their own judgment and applicable laws.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, Recruit Assistant shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
                <p className="text-gray-700">
                  You agree to indemnify and hold harmless Recruit Assistant from any claims, damages, or expenses arising from your use of the service, violation of these terms, or infringement of any rights of another party.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Compliance with Laws</h2>
                <p className="text-gray-700">
                  You are responsible for ensuring that your use of our service complies with all applicable laws and regulations, including but not limited to employment laws, anti-discrimination laws, and data protection regulations in your jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modifications</h2>
                <p className="text-gray-700">
                  We reserve the right to modify these terms at any time. We will notify users of material changes by posting the updated terms on our website. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
                <p className="text-gray-700">
                  Either party may terminate this agreement at any time. Upon termination, your right to use the service will cease immediately. We may retain certain information as required by law or for legitimate business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
                <p className="text-gray-700">
                  These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law principles. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
                <p className="text-gray-700">
                  If you have any questions about these terms of service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@recruitassistant.com<br />
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
