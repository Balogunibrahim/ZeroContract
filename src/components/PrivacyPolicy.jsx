import { COLORS, FONTS } from "../theme";

export default function PrivacyPolicy({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,20,0.6)",
        zIndex: 100,
        overflowY: "auto",
        display: "flex",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily: FONTS.body,
        textAlign: "left",
      }}
    >
      <div style={{ background: COLORS.bg, borderRadius: 2, maxWidth: 580, width: "100%", padding: "2rem 1.75rem", position: "relative" }}>
        <div style={{ borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16, marginBottom: 24 }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.label, margin: "0 0 6px" }}>
            Zero Contract
          </p>
          <h1 style={{ fontFamily: FONTS.display, fontWeight: 400, fontSize: 30, textTransform: "uppercase", letterSpacing: "-0.01em", color: COLORS.ink, margin: 0 }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: FONTS.body, color: COLORS.inkSoft, fontSize: 13, margin: "10px 0 0" }}>Last updated: July 2026</p>
        </div>

        <Section title="Who we are">
          Zero Contract is a personal shift earnings and pay tracking application. It is operated as a personal-use tool. For privacy enquiries, contact us at the email address associated with your account.
        </Section>

        <Section title="What data we collect and why">
          We collect and store the following personal data:
          <ul style={listStyle}>
            <li><strong>Account information</strong> — your email address and password (stored as a secure hash, never in plain text). Required to provide you with a private, personal account.</li>
            <li><strong>Profile information</strong> — your first name, last name, and profession. Collected to personalise your experience.</li>
            <li><strong>Tax region</strong> — which part of the UK you are in (England/Wales/Northern Ireland or Scotland). Collected solely to calculate your estimated tax liability. This field is optional and can be skipped.</li>
            <li><strong>Shift data</strong> — dates, times, hourly rates, earnings, notes, and payday dates you enter. This is the core purpose of the app.</li>
            <li><strong>Consent record</strong> — the date and time you accepted this policy. Required to demonstrate lawful processing under UK GDPR.</li>
          </ul>
          We do not collect location data, device identifiers, browsing history, or any data beyond what is listed above.
        </Section>

        <Section title="Legal basis for processing">
          Under UK GDPR, we process your data on the following legal bases:
          <ul style={listStyle}>
            <li><strong>Contract performance</strong> — processing your account and shift data is necessary to provide the service you signed up for.</li>
            <li><strong>Consent</strong> — processing your name, profession, and tax region is based on your explicit consent given at signup. You may withdraw this consent at any time by deleting your account.</li>
            <li><strong>Legitimate interest</strong> — we retain your consent record to demonstrate compliance with data protection law.</li>
          </ul>
        </Section>

        <Section title="How we store your data">
          Your data is stored securely using Supabase, a cloud database provider with servers in the EU (West Europe). Supabase applies row-level security, meaning your data is cryptographically isolated from other users. All data is transmitted over encrypted HTTPS connections. Your password is hashed using bcrypt and is never stored or transmitted in plain text.
        </Section>

        <Section title="Who we share your data with">
          We do not sell, rent, or share your personal data with third parties for marketing or any other purpose. Your data is shared only with Supabase (our database infrastructure provider) solely for the purpose of storing and serving it back to you. Supabase acts as a data processor under a data processing agreement with appropriate safeguards.
        </Section>

        <Section title="How long we keep your data">
          We retain your data for as long as your account is active. If you delete your account, all associated personal data (profile, shifts, and consent records) will be permanently deleted within 30 days. You can request deletion at any time.
        </Section>

        <Section title="Your rights under UK GDPR">
          You have the following rights regarding your personal data:
          <ul style={listStyle}>
            <li><strong>Right of access</strong> — you can request a copy of all personal data we hold about you.</li>
            <li><strong>Right to rectification</strong> — you can correct inaccurate or incomplete data via your account settings.</li>
            <li><strong>Right to erasure</strong> — you can request deletion of your account and all associated data.</li>
            <li><strong>Right to restriction</strong> — you can ask us to limit how we process your data in certain circumstances.</li>
            <li><strong>Right to data portability</strong> — you can request your shift data in a portable format.</li>
            <li><strong>Right to withdraw consent</strong> — where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
            <li><strong>Right to lodge a complaint</strong> — you have the right to complain to the UK Information Commissioner's Office (ICO) at ico.org.uk if you believe your data is being handled unlawfully.</li>
          </ul>
        </Section>

        <Section title="Tax estimates disclaimer">
          The income tax and National Insurance figures shown in this app are rough estimates only, calculated using published HMRC tax bands and rates for the current tax year. They do not account for your tax code, pension contributions, student loan repayments, other income sources, benefits in kind, or any personal circumstances that affect your actual liability. These figures should not be used for financial planning or tax filing. For accurate tax advice, consult HMRC directly at gov.uk/income-tax or speak to a qualified accountant.
        </Section>

        <Section title="Cookies">
          Zero Contract does not use cookies. Authentication sessions are stored in your browser's local session storage, which is not accessible to third parties.
        </Section>

        <Section title="Changes to this policy">
          If we make material changes to this policy, we will notify you via the app on your next login. Continued use of the app after changes are notified constitutes acceptance of the updated policy.
        </Section>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${COLORS.line}` }}>
          <button
            onClick={onClose}
            style={{ padding: "13px 20px", borderRadius: 2, border: "none", background: COLORS.black, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: FONTS.body, width: "100%" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 700, color: COLORS.ink, margin: "0 0 8px" }}>{title}</h2>
      <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

const listStyle = { margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.65 };
