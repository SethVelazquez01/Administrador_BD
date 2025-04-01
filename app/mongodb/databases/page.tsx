"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Database, Plus, Server, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { getMongoDatabases, saveMongoDatabases } from "@/lib/storage"

interface MongoDatabase {
  id: string
  name: string
  created_at: string
}

export default function MongoDatabases() {
  const [databases, setDatabases] = useState<MongoDatabase[]>([])
  const [newDbName, setNewDbName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Load databases from localStorage
    const storedDatabases = getMongoDatabases()
    if (storedDatabases.length > 0) {
      setDatabases(storedDatabases)
    } else {
      // Initialize with sample data if no stored data
      const initialDatabases = [
        { id: "1", name: "users_db", created_at: "2023-05-15T10:30:00Z" },
        { id: "2", name: "products_db", created_at: "2023-06-22T14:45:00Z" },
      ]
      setDatabases(initialDatabases)
      saveMongoDatabases(initialDatabases)
    }
  }, [])

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDbName.trim()) return

    setIsLoading(true)

    // Create new database
    setTimeout(() => {
      const newDb = {
        id: Date.now().toString(),
        name: newDbName,
        created_at: new Date().toISOString(),
      }

      const updatedDatabases = [...databases, newDb]
      setDatabases(updatedDatabases)
      saveMongoDatabases(updatedDatabases) // Save to localStorage

      setNewDbName("")
      setIsLoading(false)
      setOpen(false)

      toast({
        title: "Database created",
        description: `Database "${newDbName}" has been created successfully.`,
      })
    }, 500)
  }

  const handleDeleteDatabase = (id: string, name: string) => {
    const updatedDatabases = databases.filter((db) => db.id !== id)
    setDatabases(updatedDatabases)
    saveMongoDatabases(updatedDatabases) // Save to localStorage

    toast({
      title: "Database deleted",
      description: `Database "${name}" has been deleted.`,
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Server className="h-6 w-6" />
              <span className="font-bold">Database Manager</span>
            </Link>
            <nav className="flex gap-6">
              <Link href="/mongodb/databases" className="flex items-center text-sm font-medium text-primary">
                MongoDB
              </Link>
              <Link
                href="/mongodb/query-editor"
                className="flex items-center text-sm font-medium text-muted-foreground"
              >
                Query Editor
              </Link>
              <Link href="/network" className="flex items-center text-sm font-medium text-muted-foreground">
                Network
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">MongoDB Databases</h1>
              <p className="text-lg text-muted-foreground mt-2">Manage your MongoDB databases</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Database
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Database</DialogTitle>
                  <DialogDescription>Enter a name for your new MongoDB database.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDatabase}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Database Name</Label>
                      <Input
                        id="name"
                        value={newDbName}
                        onChange={(e) => setNewDbName(e.target.value)}
                        placeholder="e.g., users_db"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Database"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {databases.map((db) => (
              <Card key={db.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      {db.name}
                    </div>
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDatabase(db.id, db.name)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    Created: {new Date(db.created_at).toLocaleDateString()}
                  </CardDescription>
                  <div className="mt-4 flex justify-end">
                    <Link href={`/mongodb/databases/${db.id}/collections`}>
                      <Button variant="outline" size="sm">
                        Manage Collections
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

