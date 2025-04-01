"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Code, Plus, Server, Table, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getMongoDatabases,
  getMongoCollections,
  saveMongoCollections,
  getMongoDocuments,
  saveMongoDocuments,
} from "@/lib/storage"

interface MongoDocument {
  id: string
  data: any
  created_at: string
}

export default function MongoDocuments() {
  const params = useParams()
  const databaseId = params.id as string
  const collectionId = params.collectionId as string

  const [documents, setDocuments] = useState<MongoDocument[]>([])
  const [newDocumentData, setNewDocumentData] = useState("{\n  \n}")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [databaseName, setDatabaseName] = useState("")
  const [collectionName, setCollectionName] = useState("")
  const [jsonError, setJsonError] = useState("")

  useEffect(() => {
    // Find database name
    const databases = getMongoDatabases()
    const database = databases.find((db) => db.id === databaseId)
    setDatabaseName(database?.name || "Unknown Database")

    // Find collection name
    const collections = getMongoCollections(databaseId)
    const collection = collections.find((c) => c.id === collectionId)
    setCollectionName(collection?.name || "Unknown Collection")

    // Load documents from localStorage
    const storedDocuments = getMongoDocuments(databaseId, collectionId)
    if (storedDocuments.length > 0) {
      setDocuments(storedDocuments)
    } else if (databaseId === "1" && collectionId === "1") {
      // Initialize with sample data for users collection
      const initialDocuments = [
        {
          id: "1",
          data: {
            _id: "user_1",
            name: "John Doe",
            email: "john@example.com",
            age: 30,
            roles: ["user", "admin"],
          },
          created_at: "2023-05-16T10:30:00Z",
        },
        {
          id: "2",
          data: {
            _id: "user_2",
            name: "Jane Smith",
            email: "jane@example.com",
            age: 28,
            roles: ["user"],
          },
          created_at: "2023-05-17T14:45:00Z",
        },
        {
          id: "3",
          data: {
            _id: "user_3",
            name: "Bob Johnson",
            email: "bob@example.com",
            age: 35,
            roles: ["user"],
          },
          created_at: "2023-05-18T09:15:00Z",
        },
      ]
      setDocuments(initialDocuments)
      saveMongoDocuments(databaseId, collectionId, initialDocuments)

      // Update document count in the collection
      if (collection) {
        const updatedCollection = { ...collection, documentCount: initialDocuments.length }
        const updatedCollections = collections.map((c) => (c.id === collectionId ? updatedCollection : c))
        saveMongoCollections(databaseId, updatedCollections)
      }
    } else if (databaseId === "1" && collectionId === "2") {
      // Initialize with sample data for sessions collection
      const initialDocuments = [
        {
          id: "1",
          data: {
            _id: "session_1",
            userId: "user_1",
            token: "abc123xyz",
            expires: "2023-06-16T10:30:00Z",
            lastActive: "2023-05-16T10:30:00Z",
          },
          created_at: "2023-05-16T10:30:00Z",
        },
        {
          id: "2",
          data: {
            _id: "session_2",
            userId: "user_2",
            token: "def456uvw",
            expires: "2023-06-17T14:45:00Z",
            lastActive: "2023-05-17T14:45:00Z",
          },
          created_at: "2023-05-17T14:45:00Z",
        },
      ]
      setDocuments(initialDocuments)
      saveMongoDocuments(databaseId, collectionId, initialDocuments)

      // Update document count in the collection
      if (collection) {
        const updatedCollection = { ...collection, documentCount: initialDocuments.length }
        const updatedCollections = collections.map((c) => (c.id === collectionId ? updatedCollection : c))
        saveMongoCollections(databaseId, updatedCollections)
      }
    } else if (databaseId === "2" && collectionId === "1") {
      // Initialize with sample data for products collection
      const initialDocuments = [
        {
          id: "1",
          data: {
            _id: "product_1",
            name: "Smartphone",
            price: 699.99,
            category: "Electronics",
            inStock: true,
            tags: ["tech", "mobile"],
          },
          created_at: "2023-06-23T10:30:00Z",
        },
        {
          id: "2",
          data: {
            _id: "product_2",
            name: "Laptop",
            price: 1299.99,
            category: "Electronics",
            inStock: true,
            tags: ["tech", "computer"],
          },
          created_at: "2023-06-24T14:45:00Z",
        },
      ]
      setDocuments(initialDocuments)
      saveMongoDocuments(databaseId, collectionId, initialDocuments)

      // Update document count in the collection
      if (collection) {
        const updatedCollection = { ...collection, documentCount: initialDocuments.length }
        const updatedCollections = collections.map((c) => (c.id === collectionId ? updatedCollection : c))
        saveMongoCollections(databaseId, updatedCollections)
      }
    }
  }, [databaseId, collectionId])

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const parsedData = JSON.parse(newDocumentData)
      setJsonError("")
      setIsLoading(true)

      // Create new document
      setTimeout(() => {
        const newDocument = {
          id: Date.now().toString(),
          data: {
            _id: `doc_${Date.now()}`,
            ...parsedData,
          },
          created_at: new Date().toISOString(),
        }

        const updatedDocuments = [...documents, newDocument]
        setDocuments(updatedDocuments)
        saveMongoDocuments(databaseId, collectionId, updatedDocuments) // Save to localStorage

        // Update document count in the collection
        const collections = getMongoCollections(databaseId)
        const collection = collections.find((c) => c.id === collectionId)
        if (collection) {
          const updatedCollection = { ...collection, documentCount: updatedDocuments.length }
          const updatedCollections = collections.map((c) => (c.id === collectionId ? updatedCollection : c))
          saveMongoCollections(databaseId, updatedCollections)
        }

        setNewDocumentData("{\n  \n}")
        setIsLoading(false)
        setOpen(false)

        toast({
          title: "Document created",
          description: `New document has been added to collection "${collectionName}".`,
        })
      }, 500)
    } catch (error) {
      setJsonError("Invalid JSON format. Please check your input.")
    }
  }

  const handleDeleteDocument = (id: string) => {
    const updatedDocuments = documents.filter((doc) => doc.id !== id)
    setDocuments(updatedDocuments)
    saveMongoDocuments(databaseId, collectionId, updatedDocuments) // Save to localStorage

    // Update document count in the collection
    const collections = getMongoCollections(databaseId)
    const collection = collections.find((c) => c.id === collectionId)
    if (collection) {
      const updatedCollection = { ...collection, documentCount: updatedDocuments.length }
      const updatedCollections = collections.map((c) => (c.id === collectionId ? updatedCollection : c))
      saveMongoCollections(databaseId, updatedCollections)
    }

    toast({
      title: "Document deleted",
      description: `Document has been deleted from collection "${collectionName}".`,
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
              <Link
                href={`/mongodb/databases/${databaseId}/collections`}
                className="flex items-center text-sm font-medium text-muted-foreground"
              >
                {databaseName}
              </Link>
              <span className="flex items-center text-sm font-medium text-primary">{collectionName}</span>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/mongodb/databases/${databaseId}/collections`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                  Documents in {collectionName}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mt-2">Manage MongoDB documents</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>Enter JSON data for your new MongoDB document.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDocument}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="document">Document JSON</Label>
                      <Textarea
                        id="document"
                        value={newDocumentData}
                        onChange={(e) => setNewDocumentData(e.target.value)}
                        className="font-mono h-[300px]"
                      />
                      {jsonError && <p className="text-sm text-red-500">{jsonError}</p>}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Document"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {documents.length > 0 ? (
            <div className="grid gap-6">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Document ID: {doc.data._id}
                      </div>
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs mb-2">
                      Created: {new Date(doc.created_at).toLocaleDateString()}
                    </CardDescription>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                      {JSON.stringify(doc.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
              <Table className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground mt-1">Add your first document to get started</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

