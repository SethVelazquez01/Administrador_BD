"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Plus, Server, Table, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { getPostgresqlDatabases, getPostgresqlTables, getTableData, saveTableData } from "@/lib/storage"

interface Column {
  name: string
  type: string
  isPrimaryKey: boolean
  isNullable: boolean
}

interface TableData {
  [key: string]: any
}

export default function TableDataPage() {
  const params = useParams()
  const databaseId = params.id as string
  const tableId = params.tableId as string

  const [tableName, setTableName] = useState("")
  const [databaseName, setDatabaseName] = useState("")
  const [columns, setColumns] = useState<Column[]>([])
  const [data, setData] = useState<TableData[]>([])
  const [newRow, setNewRow] = useState<TableData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Find database name
    const databases = getPostgresqlDatabases()
    const database = databases.find((db) => db.id === databaseId)
    setDatabaseName(database?.name || "Unknown Database")

    // Find table and its columns
    const tables = getPostgresqlTables(databaseId)
    const table = tables.find((t) => t.id === tableId)

    if (table) {
      setTableName(table.name)
      setColumns(table.columns)

      // Initialize newRow with empty values for each column
      const emptyRow: TableData = {}
      table.columns.forEach((col) => {
        if (col.name !== "id") {
          // Skip id for new rows as it's auto-generated
          emptyRow[col.name] = col.type === "timestamp" ? new Date().toISOString() : ""
        }
      })
      setNewRow(emptyRow)

      // Load table data from localStorage
      const storedData = getTableData(databaseId, tableId)
      if (storedData.length > 0) {
        setData(storedData)
      } else if (databaseId === "1" && tableId === "1") {
        // Initialize with sample data for customers table
        const initialData = [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
          { id: 3, name: "Bob Johnson", email: "bob@example.com" },
        ]
        setData(initialData)
        saveTableData(databaseId, tableId, initialData)
      } else if (databaseId === "1" && tableId === "2") {
        // Initialize with sample data for orders table
        const initialData = [
          { id: 1, customer_id: 1, order_date: "2023-05-20T10:30:00Z" },
          { id: 2, customer_id: 1, order_date: "2023-06-15T14:45:00Z" },
          { id: 3, customer_id: 2, order_date: "2023-06-22T09:15:00Z" },
        ]
        setData(initialData)
        saveTableData(databaseId, tableId, initialData)
      }
    }
  }, [databaseId, tableId])

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const missingRequired = columns
      .filter((col) => !col.isNullable && col.name !== "id")
      .some((col) => !newRow[col.name])

    if (missingRequired) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Create new row
    setTimeout(() => {
      const nextId = Math.max(0, ...data.map((row) => row.id || 0)) + 1

      const newRowWithId = {
        id: nextId,
        ...newRow,
      }

      const updatedData = [...data, newRowWithId]
      setData(updatedData)
      saveTableData(databaseId, tableId, updatedData) // Save to localStorage

      // Reset form
      const emptyRow: TableData = {}
      columns.forEach((col) => {
        if (col.name !== "id") {
          emptyRow[col.name] = col.type === "timestamp" ? new Date().toISOString() : ""
        }
      })
      setNewRow(emptyRow)

      setIsLoading(false)
      setOpen(false)

      toast({
        title: "Row added",
        description: `New row has been added to table "${tableName}".`,
      })
    }, 500)
  }

  const handleDeleteRow = (id: number) => {
    const updatedData = data.filter((row) => row.id !== id)
    setData(updatedData)
    saveTableData(databaseId, tableId, updatedData) // Save to localStorage

    toast({
      title: "Row deleted",
      description: `Row with ID ${id} has been deleted.`,
    })
  }

  const handleInputChange = (column: string, value: string) => {
    setNewRow({
      ...newRow,
      [column]: value,
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
              <Link
                href={`/postgresql/databases/${databaseId}/tables`}
                className="flex items-center text-sm font-medium text-muted-foreground"
              >
                {databaseName}
              </Link>
              <span className="flex items-center text-sm font-medium text-primary">{tableName}</span>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/postgresql/databases/${databaseId}/tables`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                  Data in {tableName}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground mt-2">Manage table data</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Row
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Row</DialogTitle>
                  <DialogDescription>Enter values for the new row.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddRow}>
                  <div className="grid gap-4 py-4">
                    {columns.map(
                      (column) =>
                        column.name !== "id" && (
                          <div key={column.name} className="grid gap-2">
                            <Label htmlFor={column.name}>
                              {column.name}
                              {!column.isNullable && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                              id={column.name}
                              value={newRow[column.name] || ""}
                              onChange={(e) => handleInputChange(column.name, e.target.value)}
                              placeholder={`Enter ${column.name}`}
                              required={!column.isNullable}
                            />
                          </div>
                        ),
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Row"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {columns.length > 0 ? (
            <div className="border rounded-md">
              <UITable>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column.name}>
                        {column.name}
                        {column.isPrimaryKey && <span className="ml-1 text-xs text-primary">(PK)</span>}
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((row, index) => (
                      <TableRow key={index}>
                        {columns.map((column) => (
                          <TableCell key={column.name}>
                            {column.type === "timestamp" && row[column.name]
                              ? new Date(row[column.name]).toLocaleString()
                              : String(row[column.name] || "")}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(row.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center py-4">
                        No data found. Add your first row to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </UITable>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
              <Table className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Table structure not found</h3>
              <p className="text-muted-foreground mt-1">Please go back and select a valid table</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

