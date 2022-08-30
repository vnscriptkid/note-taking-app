import path from 'path'
import express from 'express'
import { MongoClient } from 'mongodb';
import { wait } from './utils';
import { retrieveNotes, saveNote } from './queries';
import multer from 'multer';
import { Client } from 'minio';
import { appConfig, checkMissingConfig } from './config';

const app = express()

const port = process.env.PORT || 3000

async function start() {
    checkMissingConfig(appConfig);
    const db = await initMongo()
    const minio = await initMinIO()

    app.set('view engine', 'pug')
    app.set('views', path.join(__dirname, 'views'))
    app.use(express.static(path.join(__dirname, 'public')))

    app.get('/', async (req, res) => res.render('index', { notes: await retrieveNotes(db) }))

    app.post(
        '/note',
        // multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
        multer({ storage: multer.memoryStorage() }).single('image'),
        async (req, res) => {
            if (!req.body.upload && req.body.description) {
                await saveNote(db, { description: req.body.description })
                res.redirect('/')
            } else if (req.body.upload && req.file) {
                // const link = `/uploads/${encodeURIComponent(req.file.filename)}`
                await minio.putObject(
                    appConfig.MINIO_BUCKET,
                    req.file.originalname,
                    req.file.buffer
                )
                const link = `/img/${encodeURIComponent(req.file.originalname)}`
                res.render('index', {
                    content: `${req.body.description} ![](${link})`,
                    notes: await retrieveNotes(db),
                })
            }
        }
    )

    app.get('/img/:name', async (req, res) => {
        const stream = await minio.getObject(
            appConfig.MINIO_BUCKET,
            decodeURIComponent(req.params.name),
        )
        stream.pipe(res)
    })

    app.listen(port, () => {
        console.log(`App listening on http://localhost:${port}`)
    })
}

async function initMongo() {
    console.log('Initialising MongoDB...')
    let success = false
    const client = new MongoClient(appConfig.MONGO_URL);
    while (!success) {
        try {
            await client.connect();
            success = true
        } catch {
            console.log('Error connecting to MongoDB, retrying in 1 second')
            await wait(1000);
        }
    }
    console.log('MongoDB initialised')

    return client.db(client.db.name).collection('notes')
}

async function initMinIO() {
    console.log('Initialising MinIO...')
    const client = new Client({
        endPoint: appConfig.MINIO_HOST,
        port: appConfig.MINIO_PORT,
        useSSL: false,
        accessKey: appConfig.MINIO_ACCESS_KEY,
        secretKey: appConfig.MINIO_SECRET_KEY,
    })
    let success = false
    while (!success) {
        try {
            if (!(await client.bucketExists(appConfig.MINIO_BUCKET))) {
                await client.makeBucket(appConfig.MINIO_BUCKET, appConfig.MINIO_REGION)
            }
            success = true
        } catch {
            await wait(1000);
        }
    }
    console.log('MinIO initialised')
    return client
}

start()