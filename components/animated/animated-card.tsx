"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cardVariants } from "@/lib/animations"
import { Card } from "@/components/ui/card"
import { forwardRef } from "react"

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  delay?: number
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        transition={{ delay }}
      >
        <Card className={className} {...props}>
          {children}
        </Card>
      </motion.div>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"
