import { Layout } from "./components/layout/Layout";
import { PreferenceForm } from "./components/preferences/PreferenceForm";
import { RecommendationsDebugPanel } from "./components/debug/RecommendationsDebugPanel";
import { useRecommendations } from "./hooks/useRecommendations";

function App() {
  const { status, data, error, errorDetails, submit } = useRecommendations();

  return (
    <Layout>
      <PreferenceForm onSubmit={submit} isSubmitting={status === "loading"} />
      <RecommendationsDebugPanel status={status} data={data} error={error} errorDetails={errorDetails} />
    </Layout>
  );
}

export default App;
