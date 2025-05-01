'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'

import { Card, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Message } from './ui/Message'

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

export function Chat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const scrollViewportRef = React.useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput('')

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'This is a simulated response from the assistant.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  React.useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages])

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col overflow-hidden">
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollAreaPrimitive.Root className="h-full">
          <ScrollAreaPrimitive.Viewport ref={scrollViewportRef} className="h-full w-full">
            <div className="flex flex-col space-y-4 p-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
            </div>
          </ScrollAreaPrimitive.Viewport>
          <ScrollAreaPrimitive.Scrollbar orientation="vertical" />
        </ScrollAreaPrimitive.Root>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}