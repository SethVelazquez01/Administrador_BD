"use client"

import { useState } from "react"
import Link from "next/link"
import { Database, Server, Table, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [selectedDb, setSelectedDb] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Server className="h-6 w-6" />
              <span className="font-bold">Database Manager</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Distributed Database Management System
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your distributed SQL and NoSQL databases across multiple network nodes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDb("postgresql")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  PostgreSQL
                </CardTitle>
                <CardDescription>
                  Relational database with support for tables, relationships, and SQL queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Features:</p>
                <ul className="ml-6 list-disc [&>li]:mt-2">
                  <li>Create and manage databases</li>
                  <li>Design tables with constraints</li>
                  <li>Define relationships between tables</li>
                  <li>Execute SQL queries</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDb("mongodb")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  MongoDB
                </CardTitle>
                <CardDescription>NoSQL database with document-oriented storage and flexible schemas</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Features:</p>
                <ul className="ml-6 list-disc [&>li]:mt-2">
                  <li>Create and manage databases</li>
                  <li>Design collections</li>
                  <li>Store JSON documents</li>
                  <li>Query with MongoDB syntax</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => (window.location.href = "/network")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Configuration
                </CardTitle>
                <CardDescription>Manage distributed database nodes across your network</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Features:</p>
                <ul className="ml-6 list-disc [&>li]:mt-2">
                  <li>Configure database nodes</li>
                  <li>Manage replication</li>
                  <li>Monitor node status</li>
                  <li>Distribute databases</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {selectedDb && (
            <div className="flex flex-col items-center mt-6 gap-4">
              <Link href={`/${selectedDb}/databases`}>
                <Button size="lg">Manage {selectedDb === "postgresql" ? "PostgreSQL" : "MongoDB"} Databases</Button>
              </Link>
              <Link href={`/${selectedDb}/query-editor`}>
                <Button variant="outline">Open {selectedDb === "postgresql" ? "SQL" : "NoSQL"} Query Editor</Button>
              </Link>
            </div>
          )}

          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Distributed Architecture Overview</h2>
            <div className="bg-muted/20 p-6 rounded-lg border">
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
                  <div className="p-4 border rounded-md bg-background shadow-sm">
                    <div className="flex flex-col items-center">
                      <Server className="h-10 w-10 text-primary mb-2" />
                      <span className="font-medium">Primary Node</span>
                      <span className="text-xs text-muted-foreground">Main database server</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-md bg-background shadow-sm">
                    <div className="flex flex-col items-center">
                      <Database className="h-10 w-10 text-green-500 mb-2" />
                      <span className="font-medium">Secondary Node</span>
                      <span className="text-xs text-muted-foreground">Read-only replica</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-md bg-background shadow-sm">
                    <div className="flex flex-col items-center">
                      <Database className="h-10 w-10 text-amber-500 mb-2" />
                      <span className="font-medium">Analytics Node</span>
                      <span className="text-xs text-muted-foreground">Data processing</span>
                    </div>
                  </div>
                </div>
                <Link href="/network">
                  <Button variant="outline">Configure Network</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

