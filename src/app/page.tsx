import { KeyboardPiano } from "./components/KeyboardPiano";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">🎹 Visualizador de Acordes</h1>
      <KeyboardPiano />
    </main>
  );
}
