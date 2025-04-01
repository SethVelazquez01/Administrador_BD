"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Database, Plus, Server, Table, Trash2 } from "lucide-react"
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
import { getMongoDatabases, getMongoCollections, saveMongoCollections } from "@/lib/storage"

interface MongoCollection {
  id: string
  name: string
  created_at: string
  documentCount: number
}

export default function MongoCollections() {
  const params = useParams()
  const databaseId = params.id as string

  const [collections, setCollections] = useState<MongoCollection[]>([])
  const [newCollectionName, setNewCollectionName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [databaseName, setDatabaseName] = useState("")

  useEffect(() => {
    // Find database name from the list of databases
    const databases = getMongoDatabases()
    const database = databases.find((db) => db.id === databaseId)
    setDatabaseName(database?.name || "Unknown Database")

    // Load collections from localStorage
    const storedCollections = getMongoCollections(databaseId)
    if (storedCollections.length > 0) {
      setCollections(storedCollections)
    } else if (databaseId === "1") {
      // Initialize with sample data for the first database if no stored data
      const initialCollections = [
        {
          id: "1",
          name: "users",
          created_at: "2023-05-16T10:30:00Z",
          documentCount: 3,
        },
        {
          id: "2",
          name: "sessions",
          created_at: "2023-05-17T14:45:00Z",
          documentCount: 12,
        },
      ]
      setCollections(initialCollections)
      saveMongoCollections(databaseId, initialCollections)
    } else if (databaseId === "2") {
      // Initialize with sample data for the second database if no stored data
      const initialCollections = [
        {
          id: "1",
          name: "products",
          created_at: "2023-06-23T10:30:00Z",
          documentCount: 25,
        },
        {
          id: "2",
          name: "categories",
          created_at: "2023-06-24T14:45:00Z",
          documentCount: 8,
        },
      ]
      setCollections(initialCollections)
      saveMongoCollections(databaseId, initialCollections)
    }
  }, [databaseId])

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return

    setIsLoading(true)

    // Create new collection
    setTimeout(() => {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName,
        created_at: new Date().toISOString(),
        documentCount: 0,
      }

      const updatedCollections = [...collections, newCollection]
      setCollections(updatedCollections)
      saveMongoCollections(databaseId, updatedCollections) // Save to localStorage

      setNewCollectionName("")
      setIsLoading(false)
      setOpen(false)

      toast({
        title: "Collection created",
        description: `Collection "${newCollectionName}" has been created successfully.`,
      })
    }, 500)
  }

  const handleDeleteCollection = (id: string, name: string) => {
    const updatedCollections = collections.filter((collection) => collection.id !== id)
    setCollections(updatedCollections)
    saveMongoCollections(databaseId, updatedCollections) // Save to localStorage

    toast({
      title: "Collection deleted",
      description: `Collection "${name}" has been deleted.`,
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
              <Link href="/mongodb/databases" className="flex items-center text-sm font-medium text-muted-foreground">
                MongoDB
              </Link>
              <span className="flex items-center text-sm font-medium text-primary">{databaseName}</span>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/mongodb/databases">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                  Collections in {databaseName}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mt-2">Manage MongoDB collections</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                  <DialogDescription>Enter a name for your new MongoDB collection.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCollection}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Collection Name</Label>
                      <Input
                        id="name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="e.g., users"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Collection"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {collections.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Card key={collection.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        {collection.name}
                      </div>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCollection(collection.id, collection.name)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      {collection.documentCount} documents • Created:{" "}
                      {new Date(collection.created_at).toLocaleDateString()}
                    </CardDescription>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/mongodb/databases/${databaseId}/collections/${collection.id}/documents`}>
                        <Button variant="outline" size="sm">
                          Manage Documents
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No collections found</h3>
              <p className="text-muted-foreground mt-1">Create your first collection to get started</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

