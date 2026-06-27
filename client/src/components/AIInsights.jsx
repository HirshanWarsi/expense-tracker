import { useState } from "react";
import {
  MdAutoAwesome,
  MdCopyAll,
  MdDownload,
  MdRefresh,
  MdPsychology,
} from "react-icons/md";
import { analyzeFinancialInsights } from "../services/expenseService";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const getScoreColor = (score) => {
  if (score >= 80) return "from-emerald-400 to-green-500";
  if (score >= 60) return "from-amber-400 to-yellow-500";
  return "from-rose-400 to-red-500";
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Stable";
  return "Needs attention";
};

const parseMarkdown = (text) => {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    if (line.startsWith("## ")) {
      return (
        <h3 key={index} className="text-lg font-semibold text-white mt-5 mb-2">
          {line.replace("## ", "")}
        </h3>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h4
          key={index}
          className="text-sm font-semibold text-violet-300 mt-3 mb-1"
        >
          {line.replace("### ", "")}
        </h4>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={index} className="ml-5 text-sm text-slate-300 leading-7">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (/^\d+\. /.test(line)) {
      return (
        <li key={index} className="ml-5 text-sm text-slate-300 leading-7">
          {line.replace(/^\d+\. /, "")}
        </li>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={index} className="text-sm font-semibold text-violet-200 mb-2">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }
    if (line.trim()) {
      return (
        <p key={index} className="text-sm text-slate-300 leading-7">
          {line}
        </p>
      );
    }
    return <div key={index} className="h-2" />;
  });
};

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await analyzeFinancialInsights();
      const payload = response?.data || response;
      setAnalysis(payload?.analysis || null);
      setReport(payload?.report || "No insights generated yet.");
    } catch (err) {
      setError("Unable to generate AI insights right now.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      setError("Copy failed. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-financial-insights.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-400/20">
            <MdPsychology className="text-violet-300 text-2xl" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              AI Financial Insights
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Personalized coaching from your transaction history.
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <MdAutoAwesome className="text-base" />
          )}
          {loading ? "Generating…" : "Generate AI Report"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-violet-500/20" />
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-700" />
              <div className="h-3 w-48 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-slate-800" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-slate-800" />
            <div className="h-3 w-10/12 animate-pulse rounded bg-slate-800" />
          </div>
        </div>
      ) : report ? (
        <div className="space-y-4">
          {analysis && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-slate-400 text-sm">
                    Financial Health Score
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${getScoreColor(analysis.financialHealthScore)} text-lg font-bold text-white`}
                    >
                      {analysis.financialHealthScore}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {getScoreLabel(analysis.financialHealthScore)}
                      </p>
                      <p className="text-slate-400 text-sm">
                        Based on balance, spending, and category balance.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-slate-500">Income</p>
                    <p className="font-semibold text-white">
                      {fmt(analysis.totalIncome)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-slate-500">Balance</p>
                    <p className="font-semibold text-white">
                      {fmt(analysis.currentBalance)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-slate-500">Largest Expense</p>
                    <p className="font-semibold text-white">
                      {fmt(analysis.largestExpense)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-slate-500">Transactions</p>
                    <p className="font-semibold text-white">
                      {analysis.numberOfTransactions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <MdCopyAll /> Copy Report
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <MdDownload /> Download
            </button>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <MdRefresh /> Regenerate
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="prose prose-invert max-w-none text-sm text-slate-300">
              {parseMarkdown(report)}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-slate-500">
          Generate your first AI financial report to see personalized coaching
          and savings guidance.
        </div>
      )}
    </div>
  );
}
