"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Copy, Check } from "lucide-react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
}

export function CodeEditor({ value, onChange, language = "javascript" }: CodeEditorProps) {
  const [output, setOutput] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault()
        const target = e.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd
        const newValue = value.substring(0, start) + "  " + value.substring(end)
        onChange(newValue)
        // Set cursor position after the inserted spaces
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2
        }, 0)
      }
    },
    [value, onChange]
  )

  const runCode = async () => {
    setIsRunning(true)
    setOutput("")
    
    try {
      // Create a safe execution environment
      const logs: string[] = []
      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push(args.map(arg => 
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          ).join(" "))
        }
      }

      // Wrap code execution
      const wrappedCode = `
        (function(console) {
          ${value}
        })
      `
      
      try {
        const fn = eval(wrappedCode)
        fn(customConsole)
        setOutput(logs.length > 0 ? logs.join("\n") : "Code executed successfully (no output)")
      } catch (execError) {
        setOutput(`Error: ${execError instanceof Error ? execError.message : "Unknown error"}`)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    onChange("")
    setOutput("")
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lineNumbers = value.split("\n").length

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden bg-[#1e1e2e]">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">{language}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-teal-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetCode}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={runCode}
              disabled={isRunning}
              className="h-7 bg-teal-500 hover:bg-teal-600 text-black"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              {isRunning ? "Running..." : "Run"}
            </Button>
          </div>
        </div>

        {/* Code Area */}
        <div className="flex">
          {/* Line Numbers */}
          <div className="py-4 px-3 text-right select-none border-r border-border/50 bg-[#181825]">
            {Array.from({ length: lineNumbers }, (_, i) => (
              <div key={i} className="text-xs leading-6 text-muted-foreground/50 font-mono">
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Editor */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 p-4 bg-transparent text-sm leading-6 font-mono text-foreground resize-none focus:outline-none min-h-[300px]"
            style={{
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Output Panel */}
      {output && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Output</span>
          </div>
          <pre className="p-4 text-sm font-mono text-foreground bg-[#1e1e2e] whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
