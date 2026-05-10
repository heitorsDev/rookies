"use client"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Copy } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/Sidebar"

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!code) {
      window.history.replaceState(null, "", "/register")
    }
  }, [code])

  function handleCopy() {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Component code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!code) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#faf7f2]">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Component Registered!</CardTitle>
              <CardDescription>
                Your component has been successfully added to the inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Component Code</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="bg-muted px-4 py-2 rounded-md font-mono text-lg">
                    {code}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    title="Copy code"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Link
                  href={`/inventory/${code}`}
                  className={cn(
                    "inline-flex h-8 gap-1.5 px-2.5 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium transition-all",
                    "bg-primary text-primary-foreground [a]:hover:bg-primary/80"
                  )}
                >
                  View Component
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "inline-flex h-8 gap-1.5 px-2.5 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
                  )}
                >
                  Register Another
                </Link>
                <Link
                  href="/inventory"
                  className={cn(
                    "inline-flex h-8 gap-1.5 px-2.5 items-center justify-center rounded-lg border border-transparent text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
                  )}
                >
                  Back to Inventory
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
