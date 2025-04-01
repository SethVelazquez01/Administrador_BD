"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Save, Server, FileCode, Database, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMongoDatabases, getMongoCollections } from "@/lib/storage"

interface QueryResult {
  data: any[]
  executionTime: number
  error?: string
}

interface SavedQuery {
  id: string
  name: string
  query: string
  database: string
  created_at: string
}

export default function MongoDBQueryEditor() {
  const [databases, setDatabases] = useState<{ id: string; name: string }[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string>("")
  const [query, setQuery] = useState<string>("db.users.find({})") // Default MongoDB query
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [queryName, setQueryName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("query")

  useEffect(() => {
    // Load databases
    const storedDatabases = getMongoDatabases()
    setDatabases(storedDatabases)
    if (storedDatabases.length > 0) {
      setSelectedDatabase(storedDatabases[0].id)
    }

    // Load saved queries
    const stored = localStorage.getItem("mongodb_saved_queries")
    if (stored) {
      setSavedQueries(JSON.parse(stored))
    } else {
      // Sample saved queries
      const initialQueries = [
        {
          id: "1",
          name: "Find all users",
          query: "db.users.find({})",
          database: "1",
          created_at: "2023-05-16T10:30:00Z",
        },
        {
          id: "2",
          name: "Find active sessions",
          query: 'db.sessions.find({ "expires": { $gt: new Date() } })',
          database: "1",
          created_at: "2023-05-17T14:45:00Z",
        },
        {
          id: "3",
          name: "Count users by role",
          query:
            'db.users.aggregate([\n  { $unwind: "$roles" },\n  { $group: { _id: "$roles", count: { $sum: 1 } } }\n])',
          database: "1",
          created_at: "2023-05-18T09:15:00Z",
        },
      ]
      setSavedQueries(initialQueries)
      localStorage.setItem("mongodb_saved_queries", JSON.stringify(initialQueries))
    }
  }, [])

  const executeQuery = () => {
    if (!selectedDatabase || !query.trim()) {
      toast({
        title: "Error",
        description: "Please select a database and enter a query.",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setResult(null)

    // Simulate query execution
    setTimeout(() => {
      try {
        // This is a mock implementation - in a real app, this would connect to a real database
        const startTime = performance.now()

        let mockResult: any[] = []

        // Parse the query to determine what kind of result to return
        const lowerQuery = query.toLowerCase().trim()

        if (lowerQuery.includes("users.find")) {
          // Mock users collection query
          mockResult = [
            {
              _id: "user_1",
              name: "John Doe",
              email: "john@example.com",
              age: 30,
              roles: ["user", "admin"],
            },
            {
              _id: "user_2",
              name: "Jane Smith",
              email: "jane@example.com",
              age: 28,
              roles: ["user"],
            },
            {
              _id: "user_3",
              name: "Bob Johnson",
              email: "bob@example.com",
              age: 35,
              roles: ["user"],
            },
          ]
        } else if (lowerQuery.includes("sessions.find")) {
          // Mock sessions collection query
          mockResult = [
            {
              _id: "session_1",
              userId: "user_1",
              token: "abc123xyz",
              expires: "2023-06-16T10:30:00Z",
              lastActive: "2023-05-16T10:30:00Z",
            },
            {
              _id: "session_2",
              userId: "user_2",
              token: "def456uvw",
              expires: "2023-06-17T14:45:00Z",
              lastActive: "2023-05-17T14:45:00Z",
            },
          ]
        } else if (lowerQuery.includes("aggregate")) {
          // Mock aggregation query
          mockResult = [
            { _id: "user", count: 3 },
            { _id: "admin", count: 1 },
          ]
        } else if (lowerQuery.includes("insertone") || lowerQuery.includes("insertmany")) {
          // Mock insert operation
          mockResult = [{ acknowledged: true, insertedId: "new_id_" + Date.now() }]
        } else if (lowerQuery.includes("updateone") || lowerQuery.includes("updatemany")) {
          // Mock update operation
          mockResult = [{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }]
        } else if (lowerQuery.includes("deleteone") || lowerQuery.includes("deletemany")) {
          // Mock delete operation
          mockResult = [{ acknowledged: true, deletedCount: 1 }]
        } else {
          // Default mock result
          mockResult = [{ result: "Query executed successfully" }]
        }

        const endTime = performance.now()

        setResult({
          data: mockResult,
          executionTime: endTime - startTime,
        })
      } catch (error) {
        setResult({
          data: [],
          executionTime: 0,
          error: "Error executing query: Invalid syntax",
        })
      }

      setIsExecuting(false)
    }, 800)
  }

  const saveQuery = () => {
    if (!selectedDatabase || !query.trim() || !queryName.trim()) {
      toast({
        title: "Error",
        description: "Please select a database, enter a query, and provide a name for your query.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Save query
    setTimeout(() => {
      const newQuery = {
        id: Date.now().toString(),
        name: queryName,
        query: query,
        database: selectedDatabase,
        created_at: new Date().toISOString(),
      }

      const updatedQueries = [...savedQueries, newQuery]
      setSavedQueries(updatedQueries)
      localStorage.setItem("mongodb_saved_queries", JSON.stringify(updatedQueries))

      setQueryName("")
      setIsSaving(false)

      toast({
        title: "Query saved",
        description: `Query "${queryName}" has been saved.`,
      })
    }, 300)
  }

  const loadSavedQuery = (savedQuery: SavedQuery) => {
    setSelectedDatabase(savedQuery.database)
    setQuery(savedQuery.query)
    setQueryName(savedQuery.name)

    toast({
      title: "Query loaded",
      description: `Query "${savedQuery.name}" has been loaded.`,
    })
  }

  const deleteSavedQuery = (id: string, name: string) => {
    const updatedQueries = savedQueries.filter((q) => q.id !== id)
    setSavedQueries(updatedQueries)
    localStorage.setItem("mongodb_saved_queries", JSON.stringify(updatedQueries))

    toast({
      title: "Query deleted",
      description: `Query "${name}" has been deleted.`,
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
              <span className="flex items-center text-sm font-medium text-primary">Query Editor</span>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/mongodb/databases">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">MongoDB Query Editor</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Query</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select database" />
                      </SelectTrigger>
                      <SelectContent>
                        {databases.map((db) => (
                          <SelectItem key={db.id} value={db.id}>
                            {db.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>Write your MongoDB query below</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                  <TabsList>
                    <TabsTrigger value="query">Query</TabsTrigger>
                    <TabsTrigger value="aggregate">Aggregate</TabsTrigger>
                    <TabsTrigger value="update">Update</TabsTrigger>
                    <TabsTrigger value="insert">Insert</TabsTrigger>
                  </TabsList>
                  <TabsContent value="query" className="mt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      Example: <code>db.collection.find(&#123; field: "value" &#125;)</code>
                    </div>
                  </TabsContent>
                  <TabsContent value="aggregate" className="mt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      Example:{" "}
                      <code>db.collection.aggregate([&#123; $match: &#123; field: "value" &#125; &#125;])</code>
                    </div>
                  </TabsContent>
                  <TabsContent value="update" className="mt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      Example:{" "}
                      <code>
                        db.collection.updateOne(&#123; field: "value" &#125;, &#123; $set: &#123; field: "new value"
                        &#125; &#125;)
                      </code>
                    </div>
                  </TabsContent>
                  <TabsContent value="insert" className="mt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      Example: <code>db.collection.insertOne(&#123; field: "value" &#125;)</code>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4">
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="db.collection.find({})"
                    className="font-mono min-h-[200px]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button onClick={executeQuery} disabled={isExecuting} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        {isExecuting ? "Executing..." : "Execute"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={queryName}
                        onChange={(e) => setQueryName(e.target.value)}
                        placeholder="Query name"
                        className="px-3 py-1 border rounded-md text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={saveQuery}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Results</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {result.data.length} document{result.data.length !== 1 ? "s" : ""} in{" "}
                      {result.executionTime.toFixed(2)} ms
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.error ? (
                    <div className="p-4 bg-red-50 text-red-500 rounded-md border border-red-200">{result.error}</div>
                  ) : (
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Saved Queries</CardTitle>
                <CardDescription>Your previously saved MongoDB queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedQueries.length > 0 ? (
                    savedQueries.map((savedQuery) => (
                      <div key={savedQuery.id} className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{savedQuery.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadSavedQuery(savedQuery)}
                              className="h-8 w-8 p-0"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSavedQuery(savedQuery.id, savedQuery.name)}
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground truncate">
                          {savedQuery.query.substring(0, 60)}
                          {savedQuery.query.length > 60 ? "..." : ""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No saved queries</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>Collections in selected database</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDatabase ? (
                  <div className="space-y-4">
                    {(() => {
                      const collections = getMongoCollections(selectedDatabase)
                      return collections.length > 0 ? (
                        collections.map((collection) => (
                          <div key={collection.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{collection.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({collection.documentCount} documents)
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">No collections found</div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">Select a database</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

