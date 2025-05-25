import { KeyboardPiano } from "./components/KeyboardPiano";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">🎹 Sintetizador de piano</h1>
      <KeyboardPiano />
    </main>
  );
}
