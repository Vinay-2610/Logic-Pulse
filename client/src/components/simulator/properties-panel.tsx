import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import type { Component } from "@shared/schema";

interface PropertiesPanelProps {
  component: Component | null;
  onUpdate: (id: string, updates: Partial<Component>) => void;
  onDelete: (id: string) => void;
}

export function PropertiesPanel({ component, onUpdate, onDelete }: PropertiesPanelProps) {
  if (!component) {
    return (
      <div className="w-80 border-l border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-sm text-muted-foreground">No component selected</p>
          <p className="text-xs text-muted-foreground mt-2">
            Click on a component to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm">Properties</h2>
        <p className="text-xs text-muted-foreground mt-1">{component.type.toUpperCase()}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="label" className="text-sm">
                Label
              </Label>
              <Input
                id="label"
                value={component.label}
                onChange={(e) => onUpdate(component.id, { label: e.target.value })}
                className="h-9"
                data-testid="input-component-label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="x" className="text-sm">
                X Position
              </Label>
              <Input
                id="x"
                type="number"
                value={component.x}
                onChange={(e) => onUpdate(component.id, { x: Number(e.target.value) })}
                className="h-9"
                data-testid="input-component-x"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="y" className="text-sm">
                Y Position
              </Label>
              <Input
                id="y"
                type="number"
                value={component.y}
                onChange={(e) => onUpdate(component.id, { y: Number(e.target.value) })}
                className="h-9"
                data-testid="input-component-y"
              />
            </div>

            {component.type === "input" && (
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm">
                  Value
                </Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="value"
                    checked={Boolean(component.value)}
                    onCheckedChange={(checked) => onUpdate(component.id, { value: checked ? 1 : 0 })}
                    data-testid="switch-input-value"
                  />
                  <span className="text-sm text-muted-foreground">
                    {component.value ? "HIGH (1)" : "LOW (0)"}
                  </span>
                </div>
              </div>
            )}

            {component.type === "clock" && (
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm">
                  Frequency (Hz)
                </Label>
                <Input
                  id="frequency"
                  type="number"
                  value={component.state?.frequency || 1}
                  onChange={(e) =>
                    onUpdate(component.id, {
                      state: { ...component.state, frequency: Number(e.target.value) },
                    })
                  }
                  className="h-9"
                  min="0.1"
                  step="0.1"
                  data-testid="input-clock-frequency"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="delay" className="text-sm">
                Propagation Delay (ns)
              </Label>
              <Input
                id="delay"
                type="number"
                value={component.propagationDelay || 1}
                onChange={(e) => onUpdate(component.id, { propagationDelay: Number(e.target.value) })}
                className="h-9"
                min="0"
                step="0.1"
                data-testid="input-propagation-delay"
              />
            </div>
          </div>

          <Separator />

          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Component Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-mono">{component.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inputs:</span>
                <span className="font-mono">{component.inputs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outputs:</span>
                <span className="font-mono">{component.outputs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs truncate max-w-32">{component.id}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onDelete(component.id)}
            data-testid="button-delete-component"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Component
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
