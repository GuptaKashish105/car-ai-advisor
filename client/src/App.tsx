import { Layout } from "./components/layout/Layout";
import { PreferenceForm } from "./components/preferences/PreferenceForm";
import { RecommendationsSection } from "./components/results/RecommendationsSection";
import { useRecommendations } from "./hooks/useRecommendations";

function App() {
  const { status, data, error, submit, retry } = useRecommendations();

  return (
    <Layout>
      <PreferenceForm onSubmit={submit} isSubmitting={status === "loading"} />
      <RecommendationsSection status={status} data={data} error={error} onRetry={retry} />
    </Layout>
  );
}

export default App;
