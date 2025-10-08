"use client"

import type React from "react"
import { useState } from "react"
import { Clock, MapPin, Users, X, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface AddCalendarEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate?: Date | null
}

const eventColors = [
  { name: "Blue", value: "#1a73e8" },
  { name: "Green", value: "#137333" },
  { name: "Purple", value: "#9334e6" },
  { name: "Red", value: "#ea4335" },
  { name: "Orange", value: "#f9ab00" },
  { name: "Pink", value: "#e91e63" },
  { name: "Teal", value: "#0d9488" },
  { name: "Indigo", value: "#4f46e5" },
]

export function AddCalendarEventDialog({ open, onOpenChange, selectedDate }: AddCalendarEventDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    attendees: "",
    color: "#1a73e8",
    allDay: false,
    reminder: "10",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New event:", formData)

    // Reset form and close dialog
    setFormData({
      title: "",
      description: "",
      date: "",
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      attendees: "",
      color: "#1a73e8",
      allDay: false,
      reminder: "10",
    })
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-normal text-gray-700">{formData.title || "New Event"}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Title */}
          <div>
            <Input
              placeholder="Add title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="text-2xl font-normal border-none px-0 focus-visible:ring-0 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-gray-400 mt-1" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-auto"
                  required
                />
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.allDay}
                    onCheckedChange={(checked) => handleInputChange("allDay", checked)}
                  />
                  <Label className="text-sm">All day</Label>
                </div>
              </div>

              {!formData.allDay && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="w-auto"
                  />
                  <span className="text-gray-400">to</span>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    className="w-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 text-gray-400 mt-1" />
            <Input
              placeholder="Add location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="border-none px-0 focus-visible:ring-0"
            />
          </div>

          {/* Description */}
          <div className="flex items-start gap-4">
            <div className="h-5 w-5 mt-1" /> {/* Spacer */}
            <Textarea
              placeholder="Add description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="border-none px-0 focus-visible:ring-0 resize-none"
              rows={3}
            />
          </div>

          {/* Attendees */}
          <div className="flex items-start gap-4">
            <Users className="h-5 w-5 text-gray-400 mt-1" />
            <Input
              placeholder="Add guests"
              value={formData.attendees}
              onChange={(e) => handleInputChange("attendees", e.target.value)}
              className="border-none px-0 focus-visible:ring-0"
            />
          </div>

          {/* Color */}
          <div className="flex items-center gap-4">
            <Palette className="h-5 w-5 text-gray-400" />
            <div className="flex gap-2">
              {eventColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${
                    formData.color === color.value ? "border-gray-400" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleInputChange("color", color.value)}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm">
                More options
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.title || !formData.date}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
