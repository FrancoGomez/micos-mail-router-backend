import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      message_id_original,
      message_id,
      from_name,
      from_email,
      to_email,
      subject,
      html,
      text,
      received_at,
      raw_headers,
      tipo,
      origen
    } = body;

    if (!message_id_original || !message_id) {
      return NextResponse.json(
        { error: "Missing message_id or message_id_original" },
        { status: 400 }
      );
    }

    // Buscar ticket
    let ticket = await prisma.ticket.findUnique({
      where: { message_id_original }
    });

    // Crear si no existe
    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: {
          message_id_original,
          ticket_key: message_id_original,
          subject_original: subject || "(sin asunto)",
          from_name: from_name || "",
          from_email,
          origen_real: "desconocido",
          sector_principal: "ventas",
          sectores_involucrados: ["ventas"]
        }
      });
    }

    // Idempotencia
    const existing = await prisma.ticketMessage.findUnique({
      where: { message_id }
    });

    if (existing) {
      return NextResponse.json({
        ticket,
        message: existing,
        status: "duplicate"
      });
    }

    // Crear mensaje
    const message = await prisma.ticketMessage.create({
      data: {
        ticket_id: ticket.id,
        message_id,
        from_name,
        from_email,
        to_email,
        subject,
        html,
        text,
        raw_headers,
        received_at: received_at ? new Date(received_at) : new Date(),
        tipo: tipo || "entrada_cliente",
        origen: origen || "desconocido"
      }
    });

    // Touch ticket
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { updated_at: new Date() }
    });

    return NextResponse.json({
      ticket,
      message,
      status: "ok"
    });

  } catch (err: any) {
    console.error("ERROR /api/messages/create:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
