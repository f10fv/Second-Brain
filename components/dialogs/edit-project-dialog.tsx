"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any | null;
  onProjectUpdated?: (project: any) => void;
}

export function EditProjectDialog({ open, onOpenChange, project, onProjectUpdated }: EditProjectDialogProps) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status?.toLowerCase() || "planning");
  const [startDate, setStartDate] = useState<Date | undefined>(project?.startDate ? new Date(project.startDate) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(project?.endDate ? new Date(project.endDate) : undefined);
  const [startDateCalendar, setStartDateCalendar] = useState(false);
  const [endDateCalendar, setEndDateCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setStatus(project.status?.toLowerCase() || "planning");
      setStartDate(project.startDate ? new Date(project.startDate) : undefined);
      setEndDate(project.endDate ? new Date(project.endDate) : undefined);
      setError(null);
    }
  }, [open, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          startDate,
          endDate,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        // prefer result.data if present, otherwise result.project
        const updated = result.data || result.project || null;
        if (onProjectUpdated && updated) onProjectUpdated(updated);
        onOpenChange(false);
      } else {
        setError(result.error || 'Failed to update project');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update project details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Title *</Label>
              <Input id="project-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter project title..." required disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your project..." rows={3} disabled={isSubmitting} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Project status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover open={startDateCalendar} onOpenChange={setStartDateCalendar} modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")} disabled={isSubmitting}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={(date) => { if (date) { setStartDate(date); setStartDateCalendar(false); } }} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover open={endDateCalendar} onOpenChange={setEndDateCalendar} modal={true}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")} disabled={isSubmitting}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={(date) => { if (date) { setEndDate(date); setEndDateCalendar(false); } }} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
