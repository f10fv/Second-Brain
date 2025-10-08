"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ViewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any | null;
}

export function ViewProjectDialog({ open, onOpenChange, project }: ViewProjectDialogProps) {
  if (!project) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Project</DialogTitle>
            <DialogDescription>No project selected</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{project.title}</DialogTitle>
          <DialogDescription>{project.description || 'No description'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="font-medium">{project.status}</div>
          <div className="text-sm text-muted-foreground">Progress</div>
          <div className="font-medium">{project.progress}%</div>
          {project.startDate && <>
            <div className="text-sm text-muted-foreground">Start Date</div>
            <div className="font-medium">{new Date(project.startDate).toLocaleDateString()}</div>
          </>}
          {project.endDate && <>
            <div className="text-sm text-muted-foreground">End Date</div>
            <div className="font-medium">{new Date(project.endDate).toLocaleDateString()}</div>
          </>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
