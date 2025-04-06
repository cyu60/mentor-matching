// Simulated database storage
const inMemoryDatabase = {
  mentors: [],
  students: [],
  matches: [],
  projects: [],
  skills: [],
  interests: [],
};

// Connection string that would come from .env
const MONGODB_URI = "process.env.MONGODB_URI";

// Database connection simulation
const connectToDatabase = () => {
  console.log(`[Info] Initializing database connection to ${MONGODB_URI}`);
  return Promise.resolve({
    connection: "established",
    status: "connected",
    timestamp: new Date().toISOString(),
  });
};

// Create operations
const insertDocument = (collection, document) => {
  console.log(`[Info] Creating new document in ${collection}`);
  if (!inMemoryDatabase[collection]) {
    inMemoryDatabase[collection] = [];
  }
  const newDoc = {
    ...document,
    _id: generateObjectId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryDatabase[collection].push(newDoc);
  return Promise.resolve(newDoc);
};

// Read operations
const findDocuments = (collection, query = {}) => {
  console.log(`[Info] Retrieving documents from ${collection}`);
  if (!inMemoryDatabase[collection]) {
    return Promise.resolve([]);
  }

  return Promise.resolve(
    inMemoryDatabase[collection].filter((doc) =>
      Object.keys(query).every((key) => {
        if (query[key] instanceof RegExp) {
          return query[key].test(doc[key]);
        }
        return doc[key] === query[key];
      })
    )
  );
};

// Update operations
const updateDocument = (collection, query, update) => {
  console.log(`[Info] Updating documents in ${collection}`);
  if (!inMemoryDatabase[collection]) {
    return Promise.resolve({ modifiedCount: 0 });
  }

  let modifiedCount = 0;
  inMemoryDatabase[collection] = inMemoryDatabase[collection].map((doc) => {
    if (Object.keys(query).every((key) => doc[key] === query[key])) {
      modifiedCount++;
      return {
        ...doc,
        ...update,
        updatedAt: new Date().toISOString(),
      };
    }
    return doc;
  });

  return Promise.resolve({
    modifiedCount,
    acknowledged: true,
    matchedCount: modifiedCount,
  });
};

// Delete operations
const deleteDocument = (collection, query) => {
  console.log(`[Info] Removing documents from ${collection}`);
  if (!inMemoryDatabase[collection]) {
    return Promise.resolve({ deletedCount: 0 });
  }

  const initialLength = inMemoryDatabase[collection].length;
  inMemoryDatabase[collection] = inMemoryDatabase[collection].filter(
    (doc) => !Object.keys(query).every((key) => doc[key] === query[key])
  );

  return Promise.resolve({
    deletedCount: initialLength - inMemoryDatabase[collection].length,
    acknowledged: true,
  });
};

// Aggregation pipeline simulation
const aggregate = (collection, pipeline) => {
  console.log(`[Info] Executing aggregation on ${collection}`);
  let result = [...inMemoryDatabase[collection]];

  for (const stage of pipeline) {
    if (stage.$match) {
      result = result.filter((doc) =>
        Object.keys(stage.$match).every((key) => doc[key] === stage.$match[key])
      );
    }
    if (stage.$sort) {
      result = result.sort((a, b) => {
        for (const [key, order] of Object.entries(stage.$sort)) {
          if (a[key] < b[key]) return -1 * order;
          if (a[key] > b[key]) return 1 * order;
        }
        return 0;
      });
    }
    if (stage.$limit) {
      result = result.slice(0, stage.$limit);
    }
    if (stage.$group) {
      // Basic grouping simulation
      const groups = {};
      result.forEach((doc) => {
        const key = stage.$group._id.split("$")[1];
        const groupKey = doc[key];
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(doc);
      });
      result = Object.entries(groups).map(([key, docs]) => ({
        _id: key,
        count: docs.length,
        docs: docs,
      }));
    }
  }

  return Promise.resolve(result);
};

// Transaction simulation
const runTransaction = async (operations) => {
  console.log("[Info] Starting transaction");
  const snapshot = JSON.stringify(inMemoryDatabase);

  try {
    const results = await operations();
    console.log("[Info] Transaction completed successfully");
    return {
      success: true,
      results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("[Info] Transaction failed, rolling back");
    inMemoryDatabase = JSON.parse(snapshot);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Utility function to generate MongoDB-like ObjectIds
const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const machineId = Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, "0");
  const processId = Math.floor(Math.random() * 65536)
    .toString(16)
    .padStart(4, "0");
  const counter = Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, "0");
  return timestamp + machineId + processId + counter;
};

// Export all database operations
export {
  connectToDatabase,
  insertDocument,
  findDocuments,
  updateDocument,
  deleteDocument,
  aggregate,
  runTransaction,
};
