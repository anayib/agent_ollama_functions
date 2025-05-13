'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'

import { Card, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Message } from './ui/message'

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

export function Chat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [conversationId, setConversationId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollViewportRef = React.useRef<HTMLDivElement>(null)

  // Create conversation on component mount
  React.useEffect(() => {
    const createNewConversation = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/conversation/create', {
          method: 'POST',
        });
        const data = await response.json();
        setConversationId(data.conversationId);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    createNewConversation();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/conversation/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: userMessage.content,
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-2xl mx-auto h-[800px] flex flex-col overflow-hidden">
      <CardContent className="flex-1 overflow-hidden p-8 bg-slate-50 dark:bg-slate-900">
        <ScrollAreaPrimitive.Root className="h-full">
          <ScrollAreaPrimitive.Viewport ref={scrollViewportRef} className="h-full w-full">
            <div className="flex flex-col space-y-4 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6 rounded-lg">
                    <p className="text-3xl font-medium dark:text-slate-400">How can I help you today?</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <Message
                    key={index}
                    role={message.role}
                    content={message.content}
                  />
                ))
              )}
              {isLoading && (
                <Message
                  role="assistant"
                  content="Thinking..."
                />
              )}
            </div>
          </ScrollAreaPrimitive.Viewport>
          <ScrollAreaPrimitive.Scrollbar orientation="vertical" />
        </ScrollAreaPrimitive.Root>
      </CardContent>
      <CardFooter className="p-4 pt-4">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading || !conversationId}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !conversationId}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}