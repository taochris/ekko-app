import ThemePage from "../../components/ThemePage";

export default async function Theme({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  return <ThemePage theme={theme} />;
}
