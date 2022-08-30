import { marked } from "marked"
import { Collection, Document } from "mongodb"

export async function retrieveNotes(db: Collection<Document>) {
    const notes = (await db.find().toArray()).reverse()
    return notes.map(it => ({
        ...it,
        description: marked(it.description)
    }))
}

export async function saveNote(db: Collection<Document>, note: any) {
    await db.insertOne(note)
}