const { MongoClient, ObjectId } = require('mongodb');

const MONGO_OPTIONS = {
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 2000,
};

let client = null;
let connectPromise = null;

const connect = async () => {
    if (client && client.topology && client.topology.isConnected()) {
        return client;
    }

    if (connectPromise) {
        return connectPromise;
    }

    try {
        connectPromise = MongoClient.connect(process.env.MONGO_URL, MONGO_OPTIONS);
        client = await connectPromise;

        console.log('\x1b[34m%s\x1b[0m', `[Mongodb] CONEXION ESTABLECIDA`);

        client.on('close', () => {
            console.warn('\x1b[31m[Mongodb]\x1b[0m Conexión cerrada.');
            client = null;
            connectPromise = null;
        });

        client.on('error', (err) => {
            console.error('\x1b[31m[Mongodb]\x1b[0m Error en la conexión:', err);
        });

        return client;
    } catch (error) {
        connectPromise = null;
        console.error('\x1b[31m[Mongodb]\x1b[0m Error al conectar:', error.message);
        // Reintentar conexión después de un delay
        setTimeout(connect, 5000);
        throw error;
    }
};

const getdb = (dbName) => {
    if (client && client.topology && client.topology.isConnected()) {
        return client.db(dbName);
    }
    return null;
};

const validConnection = async (req, res, next) => {
    if (!client || !client.topology || !client.topology.isConnected()) {
        try {
            await connect();
        } catch (e) {
            return res.status(500).json({ message: "SERVER DB ERROR" });
        }
    }

    // Double check after potential reconnect
    if (client && client.topology && client.topology.isConnected()) {
        // Optional: Ping to ensure responsiveness
        try {
            await client.db().command({ ping: 1 });
            next();
        } catch (e) {
            console.error("Ping failed", e);
            res.status(500).json({ message: "SERVER DB ERROR - PING FAILED" });
        }
    } else {
        res.status(500).json({ message: "SERVER DB ERROR" });
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    }
});

process.on('SIGTERM', async () => {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    }
});

const mongodb = {
    connect,
    getdb,
    validConnection,
    close: async () => {
        if (client) await client.close();
    }
};

module.exports = { mongoclient: client, mongodb, ObjectId };