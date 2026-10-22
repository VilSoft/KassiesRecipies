import mongoose from 'mongoose';

// Opt-in override. Deliberately not MONGO_URI: docker-compose.yml has historically
// carried a placeholder under that name, and honoring it would point a working
// deployment at the wrong database.
const MONGO_URL = process.env.RECIPES_MONGO_URI || "mongodb://localhost:27017/recipies";

// One shared connection per server process. Cached on globalThis so dev hot
// reloads reuse it instead of piling up new connections.
type MongoCache = { promise: Promise<typeof mongoose> | null }
const globalForMongo = globalThis as unknown as { _recipiesMongo?: MongoCache }
const cache: MongoCache = globalForMongo._recipiesMongo ??= { promise: null }

export const connectMongoRecipies = async () => {
    if (!cache.promise) {
        cache.promise = mongoose.connect(MONGO_URL, { family: 4 }).catch((err) => {
            // Let the next request retry instead of caching the failure
            cache.promise = null
            throw err
        })
    }
    return cache.promise
}
