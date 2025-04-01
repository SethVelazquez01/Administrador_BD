// Helper functions to work with localStorage for data persistence

// PostgreSQL storage
export const getPostgresqlDatabases = () => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("postgresql_databases")
  return stored ? JSON.parse(stored) : []
}

export const savePostgresqlDatabases = (databases) => {
  if (typeof window === "undefined") return
  localStorage.setItem("postgresql_databases", JSON.stringify(databases))
}

export const getPostgresqlTables = (databaseId) => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(`postgresql_tables_${databaseId}`)
  return stored ? JSON.parse(stored) : []
}

export const savePostgresqlTables = (databaseId, tables) => {
  if (typeof window === "undefined") return
  localStorage.setItem(`postgresql_tables_${databaseId}`, JSON.stringify(tables))
}

export const getTableData = (databaseId, tableId) => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(`postgresql_data_${databaseId}_${tableId}`)
  return stored ? JSON.parse(stored) : []
}

export const saveTableData = (databaseId, tableId, data) => {
  if (typeof window === "undefined") return
  localStorage.setItem(`postgresql_data_${databaseId}_${tableId}`, JSON.stringify(data))
}

// MongoDB storage
export const getMongoDatabases = () => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("mongodb_databases")
  return stored ? JSON.parse(stored) : []
}

export const saveMongoDatabases = (databases) => {
  if (typeof window === "undefined") return
  localStorage.setItem("mongodb_databases", JSON.stringify(databases))
}

export const getMongoCollections = (databaseId) => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(`mongodb_collections_${databaseId}`)
  return stored ? JSON.parse(stored) : []
}

export const saveMongoCollections = (databaseId, collections) => {
  if (typeof window === "undefined") return
  localStorage.setItem(`mongodb_collections_${databaseId}`, JSON.stringify(collections))
}

export const getMongoDocuments = (databaseId, collectionId) => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(`mongodb_documents_${databaseId}_${collectionId}`)
  return stored ? JSON.parse(stored) : []
}

export const saveMongoDocuments = (databaseId, collectionId, documents) => {
  if (typeof window === "undefined") return
  localStorage.setItem(`mongodb_documents_${databaseId}_${collectionId}`, JSON.stringify(documents))
}

