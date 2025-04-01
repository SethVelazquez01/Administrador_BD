"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Database, Server, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getNodeById,
  updateNodeStatus,
  getNetworkNodes,
  addDatabaseToNode,
  removeDatabaseFromNode,
  replicateDatabase,
} from "@/lib/distributed"
import { getPostgresqlDatabases, getMongoDatabases } from "@/lib/storage"

export default function NodeConfiguration() {
  const params = useParams()
  const nodeId = params.id as string

  const [node, setNode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableDatabases, setAvailableDatabases] = useState<{ id: string; name: string; type: string }[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState("")
  const [replicationSource, setReplicationSource] = useState("")
  const [replicationTargets, setReplicationTargets] = useState<string[]>([])
  const [isReplicating, setIsReplicating] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    loadNodeData()
    loadAvailableDatabases()
  }, [nodeId])

  const loadNodeData = () => {
    const nodeData = getNodeById(nodeId)
    if (nodeData) {
      setNode(nodeData)
    }
    setIsLoading(false)
  }

  const loadAvailableDatabases = () => {
    const postgresqlDbs = getPostgresqlDatabases().map((db) => ({
      id: db.id,
      name: db.name,
      type: "postgresql",
    }))

    const mongodbDbs = getMongoDatabases().map((db) => ({
      id: db.id,
      name: db.name,
      type: "mongodb",
    }))

    setAvailableDatabases([...postgresqlDbs, ...mongodbDbs])
  }

  const handleStatusToggle = () => {
    if (!node) return

    const newStatus = node.status === "online" ? "offline" : "online"
    updateNodeStatus(nodeId, newStatus)

    setNode({
      ...node,
      status: newStatus,
    })

    toast({
      title: "Status updated",
      description: `Node status changed to ${newStatus}.`,
    })
  }

  const handleAddDatabase = () => {
    if (!selectedDatabase || !node) return

    const dbToAdd = availableDatabases.find((db) => db.id === selectedDatabase)
    if (!dbToAdd) return

    addDatabaseToNode(nodeId, dbToAdd.name)

    setNode({
      ...node,
      databases: [...node.databases, dbToAdd.name],
    })

    toast({
      title: "Database added",
      description: `Database "${dbToAdd.name}" added to node.`,
    })

    setSelectedDatabase("")
  }

  const handleRemoveDatabase = (databaseName: string) => {
    if (!node) return

    removeDatabaseFromNode(nodeId, databaseName)

    setNode({
      ...node,
      databases: node.databases.filter((db: string) => db !== databaseName),
    })

    toast({
      title: "Database removed",
      description: `Database "${databaseName}" removed from node.`,
    })
  }

  const handleStartReplication = async () => {
    if (!replicationSource || replicationTargets.length === 0 || !node) return

    setIsReplicating(true)

    try {
      for (const targetId of replicationTargets) {
        await replicateDatabase(replicationSource, nodeId, targetId)
      }

      toast({
        title: "Replication complete",
        description: `Database "${replicationSource}" has been replicated to ${replicationTargets.length} node(s).`,
      })
    } catch (error) {
      toast({
        title: "Replication failed",
        description: "An error occurred during replication.",
        variant: "destructive",
      })
    }

    setIsReplicating(false)
    setReplicationSource("")
    setReplicationTargets([])
  }

  const getOtherNodes = () => {
    const allNodes = getNetworkNodes()
    return allNodes.filter((n) => n.id !== nodeId)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-primary" />
        </div>
        <p className="mt-4 text-muted-foreground">Loading node configuration...</p>
      </div>
    )
  }

  if (!node) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <X className="h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Node Not Found</h1>
        <p className="mt-2 text-muted-foreground">The requested node could not be found.</p>
        <Link href="/network" className="mt-6">
          <Button>Return to Network Configuration</Button>
        </Link>
      </div>
    )
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
              <Link href="/network" className="flex items-center text-sm font-medium text-muted-foreground">
                Network
              </Link>
              <span className="flex items-center text-sm font-medium text-primary">{node.name}</span>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/network">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">Node Configuration</h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Badge
              variant={node.status === "online" ? "default" : node.status === "syncing" ? "outline" : "destructive"}
              className="text-sm py-1 px-3"
            >
              {node.status}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              {node.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Node Status:</span>
            <Switch checked={node.status === "online"} onCheckedChange={handleStatusToggle} />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="databases">Databases</TabsTrigger>
            <TabsTrigger value="replication">Replication</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Node Information</CardTitle>
                <CardDescription>Basic information about this database node</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Node Name</Label>
                      <Input value={node.name} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Node Type</Label>
                      <Input value={node.type} readOnly className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Host Address</Label>
                      <Input value={node.host} readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Port</Label>
                      <Input value={node.port} readOnly className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <Input value={new Date(node.created_at).toLocaleString()} readOnly className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Connection Information</CardTitle>
                <CardDescription>Details for connecting to this database node</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label>Connection String</Label>
                    <div className="flex mt-1">
                      <Input
                        value={`${node.type === "primary" ? "postgresql" : "mongodb"}://${node.host}:${node.port}/database`}
                        readOnly
                        className="rounded-r-none"
                      />
                      <Button variant="secondary" className="rounded-l-none">
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Username</Label>
                      <Input value="admin" readOnly className="mt-1" />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input value="••••••••" type="password" readOnly className="mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="databases">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Database</CardTitle>
                  <CardDescription>Add a database to this node</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Database</Label>
                      <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a database" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDatabases.map((db) => (
                            <SelectItem key={db.id} value={db.id}>
                              {db.name} ({db.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddDatabase} disabled={!selectedDatabase}>
                      Add Database
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Databases</CardTitle>
                  <CardDescription>Databases currently on this node</CardDescription>
                </CardHeader>
                <CardContent>
                  {node.databases.length > 0 ? (
                    <div className="space-y-2">
                      {node.databases.map((db: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span>{db}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDatabase(db)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No databases on this node</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="replication">
            <Card>
              <CardHeader>
                <CardTitle>Database Replication</CardTitle>
                <CardDescription>Replicate databases to other nodes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Source Database</Label>
                    <Select value={replicationSource} onValueChange={setReplicationSource}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select source database" />
                      </SelectTrigger>
                      <SelectContent>
                        {node.databases.map((db: string, index: number) => (
                          <SelectItem key={index} value={db}>
                            {db}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Nodes</Label>
                    <div className="mt-2 space-y-2">
                      {getOtherNodes().map((targetNode) => (
                        <div key={targetNode.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`node-${targetNode.id}`}
                            checked={replicationTargets.includes(targetNode.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReplicationTargets([...replicationTargets, targetNode.id])
                              } else {
                                setReplicationTargets(replicationTargets.filter((id) => id !== targetNode.id))
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor={`node-${targetNode.id}`} className="text-sm font-medium">
                            {targetNode.name} ({targetNode.status})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleStartReplication}
                    disabled={isReplicating || !replicationSource || replicationTargets.length === 0}
                    className="flex items-center gap-2"
                  >
                    {isReplicating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Replicating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Start Replication
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle>Node Monitoring</CardTitle>
                <CardDescription>Performance metrics for this database node</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">CPU Usage</h3>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "35%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>35%</span>
                      <span>1 core / 2.5 GHz</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Memory Usage</h3>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "62%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>62%</span>
                      <span>1.24 GB / 2 GB</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Disk Usage</h3>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "28%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>28%</span>
                      <span>14 GB / 50 GB</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Network</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Inbound</p>
                        <p className="font-medium">1.2 MB/s</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Outbound</p>
                        <p className="font-medium">0.8 MB/s</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Active Connections</h3>
                    <p className="font-medium">12</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Uptime</h3>
                    <p className="font-medium">3 days, 7 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

