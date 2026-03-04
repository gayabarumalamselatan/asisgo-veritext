"use client";

import { useEffect, useState } from "react";
import { useVerification } from "@/lib/verification-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ChartBar,
  Check,
  Contact,
  File,
  GitCompare,
  Lightbulb,
} from "lucide-react";

const modules = [
  {
    id: "extract",
    label: "Document Extraction",
    description: "Extract and scan documents using OCR technology",
    icon: <File />,
    href: "/extract",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "compare",
    label: "Document Comparison",
    description: "Compare documents side-by-side to detect differences",
    icon: <GitCompare />,
    href: "/compare",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "compliance",
    label: "Compliance Check",
    description: "Validate documents against compliance rules",
    icon: <Check />,
    href: "/compliance",
    color: "from-green-500 to-green-600",
  },
  {
    id: "insights",
    label: "Document Insights",
    description: "Analyze documents for patterns and anomalies",
    icon: <Lightbulb />,
    href: "/insights",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "review",
    label: "Review & Decision",
    description: "Make decisions based on verification results",
    icon: <Contact />,
    href: "/review",
    color: "from-red-500 to-red-600",
  },
  {
    id: "complete",
    label: "Audit & Export",
    description: "View history and export comprehensive reports",
    icon: <ChartBar />,
    href: "/complete",
    color: "from-indigo-500 to-indigo-600",
  },
];

export default function Home() {
  const { workflow, initializeWorkflow, clearWorkflow } = useVerification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!workflow) {
      initializeWorkflow();
    }
  }, [workflow, initializeWorkflow]);

  if (!mounted || !workflow) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  Veritext
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-Powered Document Verification & Intelligence Platform
              </p>
            </div>
            <button
              onClick={() => {
                clearWorkflow();
                initializeWorkflow();
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
            >
              Reset Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Welcome to Veritext
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Choose a module to begin your document verification workflow. Each
            module operates independently for maximum flexibility and control.
          </p>
          {workflow.documents.length > 0 && (
            <p className="text-sm text-accent mt-3">
              You have <strong>{workflow.documents.length}</strong> document(s)
              loaded. They are accessible across all modules.
            </p>
          )}
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((module) => (
            <Link key={module.id} href={module.href}>
              <Card className="h-full p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-border">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl mb-4`}
                >
                  {module.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{module.label}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Open Module →
                </Button>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Start */}
        <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <h3 className="text-xl font-bold mb-4">Quick Start</h3>
          <p className="text-muted-foreground mb-6">
            New to Veritext? Start with Document Extraction to upload and scan
            your documents, then navigate through each module sequentially or
            jump directly to any step.
          </p>
          <Link href="/extract">
            <Button size="lg">Start with Extraction</Button>
          </Link>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-3">About Veritext</h4>
              <p className="text-xs text-muted-foreground">
                AI-powered document verification platform designed for
                enterprises requiring secure, accurate, and well-documented
                verification processes.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Modules</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {modules.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={m.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {m.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Features</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>OCR Document Extraction</li>
                <li>Side-by-Side Comparison</li>
                <li>Compliance Validation</li>
                <li>AI-Powered Insights</li>
                <li>Audit Trail Logging</li>
                <li>Multi-Format Export</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Veritext &copy; 2026 - AI-Powered Document Verification &
              Intelligence Platform
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
