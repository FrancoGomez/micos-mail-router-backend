import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const data = req.body

  const ticket = await prisma.ticket.upsert({
    where: { message_id_original: data.message_id_original },
    update: {
      subject: data.subject,
      from_name: data.from_name,
      from_email: data.from_email,
      origen_real: data.origen_real,
      sector_principal: data.sector_principal,
      sectores_involucrados: data.sectores_involucrados
    },
    create: {
      message_id_original: data.message_id_original,
      subject: data.subject,
      from_name: data.from_name,
      from_email: data.from_email,
      origen_real: data.origen_real,
      sector_principal: data.sector_principal,
      sectores_involucrados: data.sectores_involucrados
    }
  })

  res.json(ticket)
}
