"use client";

import { useActionState, useState, useTransition } from "react";
import { commitImport, previewImport, type ImportState, type PreviewRow } from "./actions";
import { primaryButton } from "./GuestFields";

const STATUS_STYLE: Record<PreviewRow["status"], string> = {
  ready: "text-green-700",
  duplicate: "text-amber-700",
  invalid: "text-red-700",
};

export default function ImportPanel() {
  const [previewState, previewAction, previewing] = useActionState<ImportState, FormData>(
    previewImport,
    { status: "idle" },
  );
  const [result, setResult] = useState<ImportState | null>(null);
  const [importing, startImport] = useTransition();
  const [formKey, setFormKey] = useState(0);

  // A new preview replaces any previous import result.
  const [lastPreview, setLastPreview] = useState(previewState);
  if (previewState !== lastPreview) {
    setLastPreview(previewState);
    setResult(null);
  }

  const state = result ?? previewState;
  const rows = state.status === "preview" ? state.rows : [];
  const ready = rows.filter((r) => r.status === "ready");
  const count = (s: PreviewRow["status"]) => rows.filter((r) => r.status === s).length;

  function confirmImport() {
    const guests = ready.flatMap((r) => (r.status === "ready" ? [r.guest] : []));
    startImport(async () => {
      setResult(await commitImport(guests));
      setFormKey((k) => k + 1);
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Import from Excel</h2>
        <a href="/admin/guests/template" className="text-sm text-accent underline-offset-2 hover:underline">
          Download template
        </a>
      </div>
      <p className="text-sm text-neutral-600">
        Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file whose first row has the headers{" "}
        <code>name</code>, <code>party_size</code>, and optionally <code>phone</code>, <code>email</code>,{" "}
        <code>notes</code>. You&apos;ll see a preview before anything is saved.
      </p>

      <form key={formKey} action={previewAction} className="flex flex-wrap items-center gap-3">
        <input
          name="file"
          type="file"
          required
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="text-sm file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm"
        />
        <button type="submit" disabled={previewing} className={primaryButton}>
          {previewing ? "Reading…" : "Preview"}
        </button>
      </form>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-700">{state.message}</p>
      )}

      {state.status === "done" && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          <p>
            Imported {state.inserted} {state.inserted === 1 ? "guest" : "guests"}. Their links are in the
            table below.
          </p>
          {state.skipped.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-amber-800">
              {state.skipped.map((s, i) => (
                <li key={i}>Skipped {s.name || "(no name)"}: {s.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {state.status === "preview" && (
        <div className="space-y-3">
          <p className="text-sm">
            <strong>{state.fileName}</strong>:{" "}
            <span className="text-green-700">{count("ready")} ready</span> ·{" "}
            <span className="text-amber-700">{count("duplicate")} duplicate</span> ·{" "}
            <span className="text-red-700">{count("invalid")} invalid</span>
          </p>
          <div className="max-h-72 overflow-auto rounded-md border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-2 py-1 font-medium">Row</th>
                  <th className="px-2 py-1 font-medium">Name</th>
                  <th className="px-2 py-1 font-medium">Party</th>
                  <th className="px-2 py-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.line} className="border-t border-neutral-100">
                    <td className="px-2 py-1 text-neutral-500">{row.line}</td>
                    <td className="px-2 py-1">{row.status === "ready" ? row.guest.name : row.name || "—"}</td>
                    <td className="px-2 py-1">{row.status === "ready" ? row.guest.party_size : ""}</td>
                    <td className={`px-2 py-1 ${STATUS_STYLE[row.status]}`}>
                      {row.status === "ready" ? "Ready" : `${row.status === "duplicate" ? "Duplicate" : "Invalid"}: ${row.reason}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            disabled={importing || ready.length === 0}
            onClick={confirmImport}
            className={primaryButton}
          >
            {importing
              ? "Importing…"
              : ready.length === 0
                ? "Nothing to import"
                : `Import ${ready.length} ${ready.length === 1 ? "guest" : "guests"}`}
          </button>
        </div>
      )}
    </div>
  );
}
