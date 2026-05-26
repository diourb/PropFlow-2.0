"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { generatePdfReport } from "@/app/actions";

type State = { ok: boolean; message: string; pdfBase64?: string } | null;

function DownloadForm({ state }: { state: State }) {
  useEffect(() => {
    if (!state?.ok || !state.pdfBase64) return;

    const bytes = atob(state.pdfBase64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);

    const blob = new Blob([arr], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `owner-statements-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();

    return () => URL.revokeObjectURL(url);
  }, [state]);

  return null;
}

export function PdfDownloadButton() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    generatePdfReport,
    null,
  );

  return (
    <form action={formAction}>
      <input name="type" type="hidden" value="statements" />
      <DownloadForm state={state} />
      <button
        className="flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? <Loader2 className="animate-spin" size={17} /> : <FileDown size={17} />}
        {isPending ? "Generating…" : "Export PDF"}
      </button>
    </form>
  );
}
