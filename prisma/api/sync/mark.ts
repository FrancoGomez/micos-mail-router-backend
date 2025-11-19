import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const data = req.body

  const log = await prisma.syncLog.create({
    data: {
      raw_message_id: data.raw_message_id,
      source: data.source
    }
  })

  res.json(log)
}
