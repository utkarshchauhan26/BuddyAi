"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SaraAvatarProps {
  isTyping?: boolean
  size?: "sm" | "md" | "lg"
}

export function SaraAvatar({ isTyping = false, size = "md" }: SaraAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  return (
    <div className="relative">
      <motion.div
        animate={{ 
          scale: isTyping ? [1, 1.05, 1] : 1,
        }}
        transition={{ 
          duration: 1.2, 
          repeat: isTyping ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <Avatar className={`${sizeClasses[size]} ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-background overflow-hidden`}>
          <AvatarImage src="/sara.png" alt="Sara AI" className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-slate-800 via-slate-700 to-cyan-900 flex items-center justify-center relative">
            {/* Fallback AI Character */}
            <div className="relative z-10">
              {/* Face outline */}
              <div className="w-6 h-7 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full relative">
                {/* Eyes */}
                <div className="absolute top-2 left-1.5 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="absolute top-2 right-1.5 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                {/* Smile */}
                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-1 border-b border-slate-700 rounded-full"></div>
              </div>
            </div>
          </AvatarFallback>
        </Avatar>
      </motion.div>
      
      {/* Status indicator */}
      <motion.div 
        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-background"
        animate={{ 
          scale: isTyping ? [1, 1.2, 1] : 1,
          opacity: isTyping ? [1, 0.7, 1] : 1
        }}
        transition={{ 
          duration: 0.8, 
          repeat: isTyping ? Infinity : 0 
        }}
      />
      
      {/* Typing wave animation */}
      {isTyping && (
        <motion.div
          className="absolute -top-1 -right-1 flex gap-0.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-amber-400 rounded-full"
              animate={{
                y: [-2, -6, -2],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}