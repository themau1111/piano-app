"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, type ProfileInput } from "../../../lib/schemas/profile";

export function ProfileForm({ defaultValues, onSubmit, saving }: { defaultValues: ProfileInput; onSubmit: (v: ProfileInput) => Promise<void> | void; saving?: boolean }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Nombre de usuario">
        <input
          {...register("username")}
          placeholder="p. ej. musiq_ale"
          className="w-full rounded-lg bg-white text-black/90 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <Error msg={errors.username?.message} />
        <p className="mt-1 text-xs text-white/60">3–20 caracteres. Letras, números y guión bajo.</p>
      </Field>

      <Field label="Nombre para mostrar">
        <input {...register("displayName")} placeholder="Tu nombre" className="w-full rounded-lg bg-white text-black/90 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" />
        <Error msg={errors.displayName?.message} />
      </Field>

      <Field label="Bio">
        <textarea
          {...register("bio")}
          rows={4}
          placeholder="Cuéntanos algo de ti…"
          className="w-full rounded-lg bg-white text-black/90 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        />
        <Error msg={errors.bio?.message} />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Sitio web">
          <input
            {...register("website")}
            placeholder="https://tu-sitio.com"
            className="w-full rounded-lg bg-white text-black/90 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <Error msg={errors.website?.message} />
        </Field>
        <Field label="Ubicación">
          <input
            {...register("location")}
            placeholder="Ciudad, País"
            className="w-full rounded-lg bg-white text-black/90 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <Error msg={errors.location?.message} />
        </Field>
        <Field label="Zona horaria">
          <input
            {...register("timezone")}
            placeholder="America/Mexico_City"
            className="w-full rounded-lg bg-white text-black/90 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <Error msg={errors.timezone?.message} />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={saving || !isDirty} className="px-4 py-2 rounded-lg bg-white/90 text-black font-medium hover:bg-white disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm text-white/80">{label}</div>
      {children}
    </div>
  );
}

function Error({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <div className="mt-1 text-xs text-red-200">{msg}</div>;
}
