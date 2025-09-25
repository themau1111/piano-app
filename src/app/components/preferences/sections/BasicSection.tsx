"use client";

import { Prefs } from "@/lib/prefs";
import { Card } from "../../ui/Card";
import { Label } from "../../ui/Label";
import { Select } from "../../ui/Select";
import { Segmented } from "../../ui/Segmented";

export function BasicSection({ pref, onChange }: { pref: Prefs; onChange: (p: Partial<Prefs>) => void }) {
  return (
    <Card title="Perfil básico">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tema</Label>
          <Select
            value={pref.theme}
            onChange={(v) => onChange({ theme: v as Prefs["theme"] })}
            options={[
              { value: "dark", label: "Oscuro" },
              { value: "light", label: "Claro" },
            ]}
          />
        </div>
        <div>
          <Label>Idioma</Label>
          <Select
            value={pref.locale}
            onChange={(v) => onChange({ locale: v as Prefs["locale"] })}
            options={[
              { value: "es-MX", label: "Español (MX)" },
              { value: "en", label: "English" },
            ]}
          />
        </div>
        <div className="col-span-2">
          <Label>Instrumento principal</Label>
          <Segmented
            value={pref.primaryInstrument}
            onChange={(v) => onChange({ primaryInstrument: v as Prefs["primaryInstrument"] })}
            options={[
              { value: "piano", label: "Piano" },
              { value: "keys", label: "Teclado/Synth" },
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
