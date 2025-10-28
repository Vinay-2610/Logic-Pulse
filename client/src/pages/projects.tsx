import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileCode, Cpu, Trash2, Download } from "lucide-react";
import { formatDistance } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function Projects() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleLoad = async (project: Project) => {
    try {
      if (project.type === "circuit") {
        localStorage.setItem("loadedCircuit", JSON.stringify(project.content));
        setLocation("/");
        toast({ title: `Loaded circuit: ${project.name}` });
      } else if (project.type === "verilog") {
        localStorage.setItem("loadedVerilog", JSON.stringify(project.content));
        setLocation("/verilog");
        toast({ title: `Loaded Verilog file: ${project.name}` });
      }
    } catch (error) {
      toast({ title: "Failed to load project", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1">Manage your saved circuits and Verilog files</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <p className="text-sm text-muted-foreground">
                Create circuits in the Simulator or write Verilog code in the Editor to get started
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="hover-elevate" data-testid={`project-card-${project.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {project.type === "circuit" ? (
                        <Cpu className="w-5 h-5 text-primary" />
                      ) : (
                        <FileCode className="w-5 h-5 text-primary" />
                      )}
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {project.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {project.createdAt &&
                      `Created ${formatDistance(new Date(project.createdAt), new Date(), { addSuffix: true })}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleLoad(project)}
                      data-testid={`button-load-${project.id}`}
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(project.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
