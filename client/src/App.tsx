import { useState } from "react";
import { Layout } from "./components/layout/Layout";
import { PreferenceForm } from "./components/preferences/PreferenceForm";
import type { UserPreferences } from "./types";

function App() {
  // Temporary: proves the form produces valid, well-shaped preferences.
  // Replaced by the actual results view (and the API call) in the next step.
  const [submittedPreferences, setSubmittedPreferences] = useState<UserPreferences | null>(null);

  return (
    <Layout>
      <PreferenceForm onSubmit={setSubmittedPreferences} />
      {submittedPreferences && (
        <section aria-label="Submitted preferences (debug preview)" style={{ marginTop: "1.5rem" }}>
          <h2>Preferences captured</h2>
          <pre>{JSON.stringify(submittedPreferences, null, 2)}</pre>
        </section>
      )}
    </Layout>
  );
}

export default App;
