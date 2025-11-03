import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { componentTypes } from "@shared/schema";
import { ComponentIcon } from "./component-icon";

interface ComponentPaletteProps {
  onAddComponent: (typeId: string) => void;
}

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["gates", "io", "flipflops"])
  );
  const [searchQuery, setSearchQuery] = useState("");

  const categories = {
    gates: "Logic Gates",
    io: "Input/Output",
    flipflops: "Flip-Flops",
    mux: "Multiplexers",
    encoders: "Encoders/Decoders",
    sequential: "Sequential",
    passive: "Passive Components",
    active: "Active Components",
    power: "Power Sources",
    ic: "Integrated Circuits",
  };

  const toggleSection = (category: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const filteredComponents = componentTypes.filter((comp) =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm">Components</h2>
        <p className="text-xs text-muted-foreground mt-1">Click to add to canvas</p>
        
        <div className="relative mt-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {searchQuery ? (
            // Show filtered results when searching
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground px-2">
                Search Results ({filteredComponents.length})
              </div>
              <div className="grid grid-cols-2 gap-2 p-2">
                {filteredComponents.map((comp) => (
                  <Card
                    key={comp.id}
                    className="p-3 cursor-pointer hover-elevate active-elevate-2 flex flex-col items-center gap-2 min-h-16"
                    onClick={() => onAddComponent(comp.id)}
                    data-testid={`component-${comp.id}`}
                  >
                    <ComponentIcon type={comp.id} size={24} />
                    <span className="text-xs text-center leading-tight">{comp.name}</span>
                  </Card>
                ))}
              </div>
              {filteredComponents.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No components found
                </div>
              )}
            </div>
          ) : (
            // Show categories when not searching
            Object.entries(categories).map(([category, label]) => {
              const categoryComponents = componentTypes.filter((c) => c.category === category);
              const isOpen = openSections.has(category);

            return (
              <Collapsible key={category} open={isOpen} onOpenChange={() => toggleSection(category)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-3"
                    data-testid={`category-${category}`}
                  >
                    {isOpen ? (
                      <ChevronDown className="w-3 h-3 mr-2" />
                    ) : (
                      <ChevronRight className="w-3 h-3 mr-2" />
                    )}
                    <span className="text-sm font-medium">{label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {categoryComponents.length}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {categoryComponents.map((comp) => (
                      <Card
                        key={comp.id}
                        className="p-3 cursor-pointer hover-elevate active-elevate-2 flex flex-col items-center gap-2 min-h-16"
                        onClick={() => onAddComponent(comp.id)}
                        data-testid={`component-${comp.id}`}
                      >
                        <ComponentIcon type={comp.id} size={24} />
                        <span className="text-xs text-center leading-tight">{comp.name}</span>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
