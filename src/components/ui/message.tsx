import * as React from "react"
import { cn } from "@/lib/utils"

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "assistant" | "user"
  content: string
}

export function Message({ role, content, className, ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        role === "user" ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 text-sm",
          role === "user"
            ? "bg-slate-700 text-slate-50 dark:bg-slate-600"
            : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
        )}
      >
        {content}
      </div>
    </div>
  )
}
