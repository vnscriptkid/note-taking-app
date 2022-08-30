import { Collection, Document } from "mongodb"

export async function retrieveNotes(db: Collection<Document>) {
    const notes = (await db.find().toArray()).reverse()
    return notes
}

export async function saveNote(db: Collection<Document>, note: any) {
    await db.insertOne(note)
}