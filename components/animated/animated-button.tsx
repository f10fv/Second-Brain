"use client"

import type React from "react"

import { motion } from "framer-motion"
import { buttonVariants } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { forwardRef } from "react"

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </motion.div>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"
