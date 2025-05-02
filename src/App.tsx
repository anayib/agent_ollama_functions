import { ThemeProvider } from "./components/theme-provider"
import { ModeToggle } from "./components/mode-toggle"
import { Chat } from "./components/Chat"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex items-center justify-end h-14">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-8">
          <Chat />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App