export default function BookEventPage ({ params: { clerkUserId, eventId }}: {
  params: {
    clerkUserId: string,
    eventId: string,
  }
}) {

  return <div>Event ID: {eventId}</div>
}