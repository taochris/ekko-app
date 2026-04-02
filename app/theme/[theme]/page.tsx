import { Suspense } from "react";
import ThemePage from "../../components/ThemePage";

export default async function Theme({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  return (
    <Suspense>
      <ThemePage theme={theme} />
    </Suspense>
  );
}
