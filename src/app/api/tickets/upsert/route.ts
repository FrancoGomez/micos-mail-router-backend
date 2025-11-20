import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      message_id_original,
      subject,
      from_name,
      from_email,
      origen_real,
      sector_principal,
      sectores_involucrados,
      ticket_key
    } = body;

    if (!message_id_original) {
      return NextResponse.json(
        { error: "Missing message_id_original" },
        { status: 400 }
      );
    }

    let ticket = await prisma.ticket.findUnique({
      where: { message_id_original }
    });

    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: {
          message_id_original,
          ticket_key: ticket_key || message_id_original,
          subject_original: subject || "(sin asunto)",
          from_name: from_name || "",
          from_email,
          origen_real,
          sector_principal,
          sectores_involucrados: sectores_involucrados || [sector_principal]
        }
      });

      return NextResponse.json({
        ticket,
        status: "created"
      });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        ticket_key: ticket_key || ticket.ticket_key,
        subject_original: subject || ticket.subject_original,
        from_name: from_name || ticket.from_name,
        from_email: from_email || ticket.from_email,
        origen_real: origen_real || ticket.origen_real,
        sector_principal: sector_principal || ticket.sector_principal,
        sectores_involucrados: sectores_involucrados || ticket.sectores_involucrados,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      ticket: updated,
      status: "updated"
    });

  } catch (err: any) {
    console.error("ERROR /api/tickets/upsert:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
