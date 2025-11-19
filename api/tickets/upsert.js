const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const data = req.body

  try {
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

    return res.json(ticket)

  } catch (err) {
    console.error("PRISMA ERROR:", err)

    return res.status(500).json({
      error: 'Internal server error',
      details: err.message,
      meta: err.meta
    })
  }
}
