import { databases } from '../main.js'
import { Query } from 'node-appwrite'

export async function getUpcomingEvents() {
  const data = await databases.listDocuments('hp_db', 'events', [
    Query.orderAsc('date'),
  ])

  const currentDate = new Date()

  return data.documents.filter(event => {
    const eventDateUntil = new Date(event.dateUntil)
    return eventDateUntil > currentDate
  })
}