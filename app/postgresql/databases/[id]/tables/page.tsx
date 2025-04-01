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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { getPostgresqlDatabases, getPostgresqlTables, savePostgresqlTables } from "@/lib/storage"

interface Column {
  name: string
  type: string
  isPrimaryKey: boolean
  isNullable: boolean
}

interface PostgresTable {
  id: string
  name: string
  columns: Column[]
  created_at: string
}

export default function PostgresTables() {
  const params = useParams()
  const databaseId = params.id as string

  const [tables, setTables] = useState<PostgresTable[]>([])
  const [newTableName, setNewTableName] = useState("")
  const [columns, setColumns] = useState<Column[]>([
    { name: "id", type: "serial", isPrimaryKey: true, isNullable: false },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [databaseName, setDatabaseName] = useState("")

  useEffect(() => {
    // Find database name from the list of databases
    const databases = getPostgresqlDatabases()
    const database = databases.find((db) => db.id === databaseId)
    setDatabaseName(database?.name || "Unknown Database")

    // Load tables from localStorage
    const storedTables = getPostgresqlTables(databaseId)
    if (storedTables.length > 0) {
      setTables(storedTables)
    } else if (databaseId === "1") {
      // Initialize with sample data for the first database if no stored data
      const initialTables = [
        {
          id: "1",
          name: "customers",
          columns: [
            { name: "id", type: "serial", isPrimaryKey: true, isNullable: false },
            { name: "name", type: "varchar", isPrimaryKey: false, isNullable: false },
            { name: "email", type: "varchar", isPrimaryKey: false, isNullable: true },
          ],
          created_at: "2023-05-16T10:30:00Z",
        },
        {
          id: "2",
          name: "orders",
          columns: [
            { name: "id", type: "serial", isPrimaryKey: true, isNullable: false },
            { name: "customer_id", type: "integer", isPrimaryKey: false, isNullable: false },
            { name: "order_date", type: "timestamp", isPrimaryKey: false, isNullable: false },
          ],
          created_at: "2023-05-17T14:45:00Z",
        },
      ]
      setTables(initialTables)
      savePostgresqlTables(databaseId, initialTables)
    }
  }, [databaseId])

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTableName.trim() || columns.length === 0) return

    setIsLoading(true)

    // Create new table
    setTimeout(() => {
      const newTable = {
        id: Date.now().toString(),
        name: newTableName,
        columns: [...columns],
        created_at: new Date().toISOString(),
      }

      const updatedTables = [...tables, newTable]
      setTables(updatedTables)
      savePostgresqlTables(databaseId, updatedTables) // Save to localStorage

      setNewTableName("")
      setColumns([{ name: "id", type: "serial", isPrimaryKey: true, isNullable: false }])
      setIsLoading(false)
      setOpen(false)

      toast({
        title: "Table created",
        description: `Table "${newTableName}" has been created successfully.`,
      })
    }, 500)
  }

  const handleDeleteTable = (id: string, name: string) => {
    const updatedTables = tables.filter((table) => table.id !== id)
    setTables(updatedTables)
    savePostgresqlTables(databaseId, updatedTables) // Save to localStorage

    toast({
      title: "Table deleted",
      description: `Table "${name}" has been deleted.`,
    })
  }

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "varchar", isPrimaryKey: false, isNullable: true }])
  }

  const updateColumn = (index: number, field: keyof Column, value: string | boolean) => {
    const updatedColumns = [...columns]
    updatedColumns[index] = { ...updatedColumns[index], [field]: value }
    setColumns(updatedColumns)
  }

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      const updatedColumns = [...columns]
      updatedColumns.splice(index, 1)
      setColumns(updatedColumns)
    }
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
                <Link href="/postgresql/databases">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                  Tables in {databaseName}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mt-2">Manage tables and their structure</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Table
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Table</DialogTitle>
                  <DialogDescription>Define your table structure with columns and constraints.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTable}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tableName">Table Name</Label>
                      <Input
                        id="tableName"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        placeholder="e.g., users"
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Columns</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                          Add Column
                        </Button>
                      </div>

                      <div className="border rounded-md p-4">
                        <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2">
                          <div className="col-span-3">Name</div>
                          <div className="col-span-3">Type</div>
                          <div className="col-span-2">Primary Key</div>
                          <div className="col-span-2">Nullable</div>
                          <div className="col-span-2"></div>
                        </div>

                        {columns.map((column, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-center mb-2">
                            <div className="col-span-3">
                              <Input
                                value={column.name}
                                onChange={(e) => updateColumn(index, "name", e.target.value)}
                                placeholder="Column name"
                              />
                            </div>
                            <div className="col-span-3">
                              <Select value={column.type} onValueChange={(value) => updateColumn(index, "type", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="serial">serial</SelectItem>
                                  <SelectItem value="integer">integer</SelectItem>
                                  <SelectItem value="varchar">varchar</SelectItem>
                                  <SelectItem value="text">text</SelectItem>
                                  <SelectItem value="boolean">boolean</SelectItem>
                                  <SelectItem value="timestamp">timestamp</SelectItem>
                                  <SelectItem value="date">date</SelectItem>
                                  <SelectItem value="numeric">numeric</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <Checkbox
                                checked={column.isPrimaryKey}
                                onCheckedChange={(checked) => updateColumn(index, "isPrimaryKey", checked === true)}
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <Checkbox
                                checked={column.isNullable}
                                onCheckedChange={(checked) => updateColumn(index, "isNullable", checked === true)}
                                disabled={column.isPrimaryKey}
                              />
                            </div>
                            <div className="col-span-2 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeColumn(index)}
                                disabled={columns.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading || !newTableName || columns.some((c) => !c.name)}>
                      {isLoading ? "Creating..." : "Create Table"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {tables.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tables.map((table) => (
                <Card key={table.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        {table.name}
                      </div>
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTable(table.id, table.name)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      {table.columns.length} columns • Created: {new Date(table.created_at).toLocaleDateString()}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="text-xs font-medium">Columns:</div>
                      <div className="mt-1 space-y-1">
                        {table.columns.map((column, i) => (
                          <div key={i} className="text-xs flex items-center gap-1">
                            <span className="font-medium">{column.name}</span>
                            <span className="text-muted-foreground">({column.type})</span>
                            {column.isPrimaryKey && (
                              <span className="text-xs bg-primary/10 text-primary px-1 rounded">PK</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/postgresql/databases/${databaseId}/tables/${table.id}/data`}>
                        <Button variant="outline" size="sm">
                          Manage Data
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
              <h3 className="text-lg font-medium">No tables found</h3>
              <p className="text-muted-foreground mt-1">Create your first table to get started</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

