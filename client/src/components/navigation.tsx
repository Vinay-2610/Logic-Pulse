import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Cpu, FileCode, FolderOpen, BookOpen } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "Simulator", icon: Cpu },
    { path: "/verilog", label: "Verilog", icon: FileCode },
    { path: "/projects", label: "Projects", icon: FolderOpen },
    { path: "/docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">LogicPulse</h1>
        </div>

        <nav className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location === tab.path;

            return (
              <Link key={tab.path} href={tab.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                  data-testid={`nav-${tab.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-xs text-muted-foreground">
        Circuit Simulator & Verilog Editor
      </div>
    </header>
  );
}
