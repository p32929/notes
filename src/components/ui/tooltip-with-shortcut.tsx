import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getShortcutDisplay } from '@/hooks/useKeyboardShortcuts'

interface TooltipWithShortcutProps {
  children: React.ReactNode
  title: string
  description?: string
  shortcut?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export const TooltipWithShortcut: React.FC<TooltipWithShortcutProps> = ({
  children,
  title,
  description,
  shortcut,
  side = 'top',
  className = ''
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        <div className="flex flex-col">
          <span className="font-medium text-white">{title}</span>
          {description && (
            <span className="text-xs text-white mt-1">{description}</span>
          )}
          {shortcut && (
            <span className="text-xs text-white mt-1">{getShortcutDisplay(shortcut)}</span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// Simple tooltip without shortcut
export const SimpleTooltip: React.FC<Omit<TooltipWithShortcutProps, 'shortcut' | 'description'>> = ({
  children,
  title,
  side = 'top',
  className = ''
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        <span className="font-medium text-white">{title}</span>
      </TooltipContent>
    </Tooltip>
  )
}