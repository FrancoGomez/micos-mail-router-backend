import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";  // ya existe
import { z } from "zod";

// --- VALIDACIÓN ---
const IngestSchema = z.object({
  message_id: z.string(),
  message_id_original: z.string(),
  in_reply_to: z.string().nullable().optional(),
  subject: z.string(),
  from_name: z.string(),
  from_email: z.string(),
  to_email: z.string(),
  html: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  received_at: z.string(), // ISO
  origen_real: z.string(),
  sector_principal: z.string(),
  sectores_involucrados: z.array(z.string()),
  ticket_key: z.string(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const data = IngestSchema.parse(raw);

    const {
      ticket_key,
      message_id,
      message_id_original,
      subject,
      from_name,
      from_email,
      to_email,
      html,
      text,
      received_at,
      origen_real,
      sector_principal,
      sectores_involucrados,
    } = data;

    // 1 — Buscar ticket por ticket_key
    let ticket = await prisma.ticket.findUnique({
      where: { ticket_key },
    });

    // 2 — Crear ticket si no existe
    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: {
          ticket_key,
          message_id_original,
          subject,
          from_name,
          from_email,
          origen_real,
          sector_principal,
          sectores_involucrados,
        },
      });
    } else {
      // actualizar sectores_involucrados si entran por 2 lugares
      const mergedSectores = Array.from(
        new Set([
          ...ticket.sectores_involucrados,
          ...sectores_involucrados,
        ])
      );

      ticket = await prisma.ticket.update({
        where: { ticket_key },
        data: {
          subject,
          from_name,
          from_email,
          origen_real,
          sector_principal,
          sectores_involucrados: mergedSectores,
        },
      });
    }

    // 3 — Crear mensaje (idempotente)
    await prisma.ticketMessage.upsert({
      where: { message_id },
      create: {
        ticketId: ticket.id,
        message_id,
        from_email,
        from_name,
        html,
        text,
        created_at: new Date(received_at),
      },
      update: {
        html,
        text,
      },
    });

    return NextResponse.json({
      ok: true,
      ticket_id: ticket.id,
    });
  } catch (err) {
    console.error("INGEST ERROR", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 400 }
    );
  }
}
