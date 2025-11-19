const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const log = await prisma.syncLog.create({
      data: req.body
    })

    res.json(log)

  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Internal server error' })
  }
}
