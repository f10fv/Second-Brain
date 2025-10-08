// "use client"

// import type React from "react"

// import { motion } from "framer-motion"
// import { pageVariants, pageTransition } from "@/lib/animations"

// interface PageWrapperProps {
//   children: React.ReactNode
//   className?: string
// }

// export function PageWrapper({ children, className = "" }: PageWrapperProps) {
//   return (
//     <motion.div
//       initial="initial"
//       animate="in"
//       exit="out"
//       variants={pageVariants}
//       transition={pageTransition}
//       className={className}
//     >
//       {children}
//     </motion.div>
//   )
// }

"use client"

import type React from "react"

import { motion } from "framer-motion"
import { pageVariants, pageTransition } from "@/lib/animations"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
