import path from 'path'
import express from 'express'
import { MongoClient } from 'mongodb';
import { wait } from './utils';
import { retrieveNotes, saveNote } from './queries';
import multer from 'multer';

const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/dev'

const app = express()

const port = process.env.PORT || 3000

async function start() {
    const db = await initMongo()

    app.set('view engine', 'pug')
    app.set('views', path.join(__dirname, 'views'))
    app.use(express.static(path.join(__dirname, 'public')))

    app.get('/', async (req, res) => res.render('index', { notes: await retrieveNotes(db) }))

    app.post(
        '/note',
        multer({ dest: path.join(__dirname, 'public/uploads/') }).single('image'),
        async (req, res) => {
            if (!req.body.upload && req.body.description) {
                await saveNote(db, { description: req.body.description })
                res.redirect('/')
            } else if (req.body.upload && req.file) {
                const link = `/uploads/${encodeURIComponent(req.file.filename)}`
                res.render('index', {
                    content: `${req.body.description} ![](${link})`,
                    notes: await retrieveNotes(db),
                })
            }
        }
    )

    app.listen(port, () => {
        console.log(`App listening on http://localhost:${port}`)
    })
}

async function initMongo() {
    console.log('Initialising MongoDB...')
    let success = false
    const client = new MongoClient(mongoURL);
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

start()