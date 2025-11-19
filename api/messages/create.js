const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const msg = await prisma.ticketMessage.create({
      data: req.body
    })

    res.json(msg)

  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal server error' })
  }
}
