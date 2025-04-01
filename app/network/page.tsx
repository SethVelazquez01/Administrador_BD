"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Network, Plus, Server, Trash2, Database } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NetworkNode {
  id: string
  name: string
  host: string
  port: string
  type: "primary" | "secondary" | "replica"
  status: "online" | "offline" | "syncing"
  databases: string[]
  created_at: string
}

export default function NetworkConfiguration() {
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [newNode, setNewNode] = useState({
    name: "",
    host: "",
    port: "5432",
    type: "secondary" as const,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Load nodes from localStorage
    const storedNodes = localStorage.getItem("network_nodes")
    if (storedNodes) {
      setNodes(JSON.parse(storedNodes))
    } else {
      // Initialize with sample data
      const initialNodes = [
        {
          id: "1",
          name: "Primary Node",
          host: "db-primary.example.com",
          port: "5432",
          type: "primary",
          status: "online",
          databases: ["customers_db", "inventory_db"],
          created_at: "2023-05-15T10:30:00Z",
        },
        {
          id: "2",
          name: "Analytics Node",
          host: "db-analytics.example.com",
          port: "27017",
          type: "secondary",
          status: "online",
          databases: ["analytics_db"],
          created_at: "2023-06-22T14:45:00Z",
        },
        {
          id: "3",
          name: "Replica Node 1",
          host: "db-replica-1.example.com",
          port: "5432",
          type: "replica",
          status: "syncing",
          databases: ["customers_db"],
          created_at: "2023-07-10T09:15:00Z",
        },
      ] as NetworkNode[]
      setNodes(initialNodes)
      localStorage.setItem("network_nodes", JSON.stringify(initialNodes))
    }
  }, [])

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNode.name.trim() || !newNode.host.trim() || !newNode.port.trim()) return

    setIsLoading(true)

    // Create new node
    setTimeout(() => {
      const node: NetworkNode = {
        id: Date.now().toString(),
        name: newNode.name,
        host: newNode.host,
        port: newNode.port,
        type: newNode.type,
        status: "offline",
        databases: [],
        created_at: new Date().toISOString(),
      }

      const updatedNodes = [...nodes, node]
      setNodes(updatedNodes)
      localStorage.setItem("network_nodes", JSON.stringify(updatedNodes))

      setNewNode({
        name: "",
        host: "",
        port: "5432",
        type: "secondary",
      })
      setIsLoading(false)
      setOpen(false)

      toast({
        title: "Node added",
        description: `Node "${newNode.name}" has been added to the network.`,
      })
    }, 500)
  }

  const handleDeleteNode = (id: string, name: string) => {
    const updatedNodes = nodes.filter((node) => node.id !== id)
    setNodes(updatedNodes)
    localStorage.setItem("network_nodes", JSON.stringify(updatedNodes))

    toast({
      title: "Node deleted",
      description: `Node "${name}" has been removed from the network.`,
    })
  }

  const toggleNodeStatus = (id: string) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        const newStatus = node.status === "online" ? "offline" : "online"
        return { ...node, status: newStatus }
      }
      return node
    })
    setNodes(updatedNodes)
    localStorage.setItem("network_nodes", JSON.stringify(updatedNodes))

    const node = nodes.find((n) => n.id === id)
    toast({
      title: "Status changed",
      description: `Node "${node?.name}" is now ${node?.status === "online" ? "offline" : "online"}.`,
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
              <Link href="/network" className="flex items-center text-sm font-medium text-primary">
                Network
              </Link>
              <Link
                href="/postgresql/databases"
                className="flex items-center text-sm font-medium text-muted-foreground"
              >
                PostgreSQL
              </Link>
              <Link href="/mongodb/databases" className="flex items-center text-sm font-medium text-muted-foreground">
                MongoDB
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                Network Configuration
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Manage distributed database nodes across your network
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Node
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Network Node</DialogTitle>
                  <DialogDescription>Configure a new database node in your distributed network.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateNode}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Node Name</Label>
                      <Input
                        id="name"
                        value={newNode.name}
                        onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                        placeholder="e.g., Analytics Node"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="host">Host Address</Label>
                      <Input
                        id="host"
                        value={newNode.host}
                        onChange={(e) => setNewNode({ ...newNode, host: e.target.value })}
                        placeholder="e.g., db.example.com or 192.168.1.10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        value={newNode.port}
                        onChange={(e) => setNewNode({ ...newNode, port: e.target.value })}
                        placeholder="e.g., 5432 or 27017"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Node Type</Label>
                      <Select
                        value={newNode.type}
                        onValueChange={(value: "primary" | "secondary" | "replica") =>
                          setNewNode({ ...newNode, type: value })
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select node type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="replica">Replica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Node"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nodes.map((node) => (
              <Card key={node.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      {node.name}
                    </div>
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteNode(node.id, node.name)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        node.status === "online" ? "default" : node.status === "syncing" ? "outline" : "destructive"
                      }
                      className="mb-2"
                    >
                      {node.status}
                    </Badge>
                    <Badge variant="outline" className="mb-2">
                      {node.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mb-4">
                    <div className="grid grid-cols-2 gap-1">
                      <span className="font-medium">Host:</span>
                      <span>{node.host}</span>
                      <span className="font-medium">Port:</span>
                      <span>{node.port}</span>
                      <span className="font-medium">Created:</span>
                      <span>{new Date(node.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardDescription>
                  {node.databases.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-1">Databases:</p>
                      <div className="flex flex-wrap gap-1">
                        {node.databases.map((db, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {db}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant={node.status === "online" ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleNodeStatus(node.id)}
                    >
                      {node.status === "online" ? "Stop" : "Start"}
                    </Button>
                    <Link href={`/network/${node.id}`}>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Network Topology</h2>
            <div className="border rounded-lg p-6 bg-muted/20">
              <div className="flex flex-col items-center">
                <div className="mb-8 p-4 border rounded-md bg-background shadow-sm">
                  {nodes.find((node) => node.type === "primary") ? (
                    <div className="flex flex-col items-center">
                      <Server className="h-12 w-12 text-primary mb-2" />
                      <span className="font-medium">Primary Node</span>
                      <span className="text-xs text-muted-foreground">
                        {nodes.find((node) => node.type === "primary")?.host}:
                        {nodes.find((node) => node.type === "primary")?.port}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Server className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="font-medium">No Primary Node</span>
                    </div>
                  )}
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {nodes
                    .filter((node) => node.type !== "primary")
                    .map((node) => (
                      <div key={node.id} className="p-4 border rounded-md bg-background shadow-sm">
                        <div className="flex flex-col items-center">
                          <Database
                            className={`h-10 w-10 mb-2 ${
                              node.status === "online"
                                ? "text-green-500"
                                : node.status === "syncing"
                                  ? "text-amber-500"
                                  : "text-red-500"
                            }`}
                          />
                          <span className="font-medium">{node.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {node.host}:{node.port}
                          </span>
                          <Badge variant="outline" className="mt-2">
                            {node.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

