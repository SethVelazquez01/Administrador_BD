"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Save, Server, FileCode, Database, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPostgresqlDatabases, getPostgresqlTables } from "@/lib/storage"

interface QueryResult {
  columns: string[]
  rows: any[]
  rowCount: number
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

export default function PostgreSQLQueryEditor() {
  const [databases, setDatabases] = useState<{ id: string; name: string }[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string>("")
  const [query, setQuery] = useState<string>("SELECT * FROM customers LIMIT 10;")
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [queryName, setQueryName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load databases
    const storedDatabases = getPostgresqlDatabases()
    setDatabases(storedDatabases)
    if (storedDatabases.length > 0) {
      setSelectedDatabase(storedDatabases[0].id)
    }

    // Load saved queries
    const stored = localStorage.getItem("postgresql_saved_queries")
    if (stored) {
      setSavedQueries(JSON.parse(stored))
    } else {
      // Sample saved queries
      const initialQueries = [
        {
          id: "1",
          name: "List all customers",
          query: "SELECT * FROM customers ORDER BY id;",
          database: "1",
          created_at: "2023-05-16T10:30:00Z",
        },
        {
          id: "2",
          name: "Recent orders",
          query: "SELECT * FROM orders ORDER BY order_date DESC LIMIT 5;",
          database: "1",
          created_at: "2023-05-17T14:45:00Z",
        },
        {
          id: "3",
          name: "Customer order count",
          query: `SELECT c.name, COUNT(o.id) as order_count 
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY order_count DESC;`,
          database: "1",
          created_at: "2023-05-18T09:15:00Z",
        },
      ]
      setSavedQueries(initialQueries)
      localStorage.setItem("postgresql_saved_queries", JSON.stringify(initialQueries))
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

        const mockResult: QueryResult = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: 0,
        }

        // Parse the query to determine what kind of result to return
        const lowerQuery = query.toLowerCase().trim()

        if (lowerQuery.includes("select") && lowerQuery.includes("from customers")) {
          // Mock customer data query
          mockResult.columns = ["id", "name", "email"]
          mockResult.rows = [
            { id: 1, name: "John Doe", email: "john@example.com" },
            { id: 2, name: "Jane Smith", email: "jane@example.com" },
            { id: 3, name: "Bob Johnson", email: "bob@example.com" },
          ]
          mockResult.rowCount = 3
        } else if (lowerQuery.includes("select") && lowerQuery.includes("from orders")) {
          // Mock order data query
          mockResult.columns = ["id", "customer_id", "order_date"]
          mockResult.rows = [
            { id: 1, customer_id: 1, order_date: "2023-05-20T10:30:00Z" },
            { id: 2, customer_id: 1, order_date: "2023-06-15T14:45:00Z" },
            { id: 3, customer_id: 2, order_date: "2023-06-22T09:15:00Z" },
          ]
          mockResult.rowCount = 3
        } else if (lowerQuery.includes("join")) {
          // Mock join query
          mockResult.columns = ["name", "order_count"]
          mockResult.rows = [
            { name: "John Doe", order_count: 2 },
            { name: "Jane Smith", order_count: 1 },
            { name: "Bob Johnson", order_count: 0 },
          ]
          mockResult.rowCount = 3
        } else if (lowerQuery.includes("insert") || lowerQuery.includes("update") || lowerQuery.includes("delete")) {
          // Mock DML statement
          mockResult.columns = ["affected_rows"]
          mockResult.rows = [{ affected_rows: 1 }]
          mockResult.rowCount = 1
        } else if (lowerQuery.includes("create") || lowerQuery.includes("alter") || lowerQuery.includes("drop")) {
          // Mock DDL statement
          mockResult.columns = ["result"]
          mockResult.rows = [{ result: "Query executed successfully" }]
          mockResult.rowCount = 1
        } else {
          // Default mock result
          mockResult.columns = ["result"]
          mockResult.rows = [{ result: "Query executed successfully" }]
          mockResult.rowCount = 1
        }

        const endTime = performance.now()
        mockResult.executionTime = endTime - startTime

        setResult(mockResult)
      } catch (error) {
        setResult({
          columns: ["error"],
          rows: [{ error: "Error executing query" }],
          rowCount: 0,
          executionTime: 0,
          error: "Syntax error in SQL query",
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
      localStorage.setItem("postgresql_saved_queries", JSON.stringify(updatedQueries))

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
    localStorage.setItem("postgresql_saved_queries", JSON.stringify(updatedQueries))

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
              <Link
                href="/postgresql/databases"
                className="flex items-center text-sm font-medium text-muted-foreground"
              >
                PostgreSQL
              </Link>
              <span className="flex items-center text-sm font-medium text-primary">Query Editor</span>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/postgresql/databases">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">SQL Query Editor</h1>
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
                <CardDescription>Write your SQL query below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SELECT * FROM table_name;"
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
                      {result.rowCount} row{result.rowCount !== 1 ? "s" : ""} in {result.executionTime.toFixed(2)} ms
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.error ? (
                    <div className="p-4 bg-red-50 text-red-500 rounded-md border border-red-200">{result.error}</div>
                  ) : (
                    <div className="border rounded-md overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {result.columns.map((column, i) => (
                              <TableHead key={i}>{column}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.rows.map((row, i) => (
                            <TableRow key={i}>
                              {result.columns.map((column, j) => (
                                <TableCell key={j}>
                                  {row[column] !== null && row[column] !== undefined ? String(row[column]) : "NULL"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Saved Queries</CardTitle>
                <CardDescription>Your previously saved SQL queries</CardDescription>
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
                <CardDescription>Tables in selected database</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDatabase ? (
                  <div className="space-y-4">
                    {(() => {
                      const tables = getPostgresqlTables(selectedDatabase)
                      return tables.length > 0 ? (
                        tables.map((table) => (
                          <div key={table.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{table.name}</span>
                            </div>
                            <div className="pl-6 text-xs space-y-1">
                              {table.columns.map((column, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className="font-medium">{column.name}</span>
                                  <span className="text-muted-foreground">({column.type})</span>
                                  {column.isPrimaryKey && (
                                    <span className="text-xs bg-primary/10 text-primary px-1 rounded">PK</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">No tables found</div>
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

