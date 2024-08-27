import { databases } from '../main.js'
import { Query } from 'node-appwrite'

export async function getEvent(query) {
  const currentDate = new Date()

  const data = await databases.getDocument(
    'hp_db',
    'events',
    `${query.eventId}`
  )

  return data.documents.filter(event => {
    const eventDateUntil = new Date(event.dateUntil)
    return eventDateUntil > currentDate
  })
}

export async function getNextEvent() {
  const currentDate = new Date()

  const data = await databases.listDocuments(
    'hp_db',
    'events',
    [
      Query.orderAsc('date'),
      Query.greaterThanEqual('date', currentDate.toISOString()),
    ]
  )

  return data.documents.filter(event => {
    const eventDateUntil = new Date(event.dateUntil)
    return eventDateUntil > currentDate
  })[0]
}

export async function getEvents() {
  const currentDate = new Date()

  const data = await databases.listDocuments(
    'hp_db',
    'events',
    [
      Query.orderAsc('date'),
      Query.greaterThanEqual('dateUntil', currentDate.toISOString()),
      Query.lessThanEqual('date', currentDate.toISOString()),
    ]
  )

  return data.documents.filter(event => {
    const eventDateUntil = new Date(event.dateUntil)
    return eventDateUntil > currentDate
  })
}

export async function getUpcomingEvents() {
  const currentDate = new Date()

  const data = await databases.listDocuments(
    'hp_db',
    'events',
    [
      Query.orderAsc('date'),
      Query.greaterThanEqual('date', currentDate.toISOString()),
    ]
  )

  return data.documents.filter(event => {
    const eventDateUntil = new Date(event.dateUntil)
    return eventDateUntil > currentDate
  })
}

export async function getArchivedEvents() {
  const currentDate = new Date()

  const data = await databases.listDocuments(
    'hp_db',
    'events',
    [
      Query.orderAsc('date'),
      Query.lessThan('dateUntil', currentDate.toISOString()),
    ]
  )

  return data.documents.filter(event => {
    const eventDateUntil = new Date(event.dateUntil)
    return eventDateUntil > currentDate
  })
}