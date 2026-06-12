import { Suspense } from "react";
import ThemePage from "../../components/ThemePage";

export default async function ThemePorteClef({ params, searchParams }: { params: Promise<{ theme: string }>; searchParams: Promise<{ format?: string }> }) {
  const { theme } = await params;
  const { format } = await searchParams;
  return (
    <Suspense>
      <ThemePage theme={theme} hideImageUpload={true} variant="porteClef" initialFormat={format} />
    </Suspense>
  );
}
