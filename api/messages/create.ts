import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const data = req.body

  const msg = await prisma.ticketMessage.create({
    data: {
      ticket_id: data.ticket_id,
      direction: data.direction,
      raw_message_id: data.raw_message_id,
      references_in: data.references_in,
      body_html: data.body_html,
      body_text: data.body_text,
      attachments: data.attachments,
      interno_responde: data.interno_responde
    }
  })

  res.json(msg)
}
