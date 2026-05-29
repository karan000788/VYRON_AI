export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-zinc-400">
        VYRON AI processes business data per the India Digital Personal Data Protection Act (DPDP).
        Financial records are retained for 8 years. AI chat history is deleted after 90 days.
        Activity logs are retained for 1 year. Upon cancellation, accounts are read-only for 30 days
        before PII anonymization.
      </p>
      <h2>Data Controller</h2>
      <p>VYRON AI is the data controller for account, workspace, billing, support, and product usage data processed through the platform.</p>
      <h2>Cookie Policy</h2>
      <p>We use essential cookies for login sessions, workspace selection, and security. Optional analytics cookies help us improve product reliability and user experience.</p>
      <h2>User Rights</h2>
      <p>You may request access, correction, export, or deletion of personal data. Some accounting records may be retained where Indian law requires retention.</p>
      <h2 id="dpdp">DPDP Retention And Protection</h2>
      <p>Client data is protected under DPDP principles, including purpose limitation, security safeguards, and deletion or anonymization after retention periods expire.</p>
      <h2>Privacy Requests And Complaints</h2>
      <p>Send privacy requests to support@vyron.ai. If unresolved, you may raise a complaint with the relevant Data Protection Board or applicable Indian authority.</p>
    </div>
  );
}
