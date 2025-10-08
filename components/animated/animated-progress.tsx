"use client"

import type React from "react"

import { motion } from "framer-motion"
import { progressVariants } from "@/lib/animations"
import { Progress } from "@/components/ui/progress"

interface AnimatedProgressProps extends React.ComponentProps<typeof Progress> {
  value: number
  delay?: number
}

export function AnimatedProgress({ value, delay = 0, className, ...props }: AnimatedProgressProps) {
  return (
    <div className="relative">
      <Progress value={0} className={className} {...props} />
      <motion.div
        className="absolute top-0 left-0 h-full bg-primary rounded-full"
        variants={progressVariants}
        initial="initial"
        animate="animate"
        custom={value}
        transition={{ delay }}
      />
    </div>
  )
}
