// /api/chat — Función serverless de Vercel
// Lee la API key desde las variables de entorno del proyecto:
//   ANTHROPIC_API_KEY  (Claude)  — o —  OPENAI_API_KEY  (GPT)
// Detecta automáticamente cuál existe. La key nunca llega al navegador.

const SYSTEM = `Eres AURA, la asistente virtual de WhatsApp de DOGTOR PETS, clínica veterinaria del Dr. José Luis Perales en Monterrey, N.L. — "Domestic & Exotic Veterinary": atienden mascotas tradicionales Y especies exóticas (hurones, reptiles, aves, conejos, erizos, roedores, primates pequeños).

HOY ES: miércoles 8 de julio de 2026.

TU PERSONALIDAD: cálida, cercana y profesional. Hablas SIEMPRE de usted. Mensajes CORTOS estilo WhatsApp (2-4 líneas máximo), con algún emoji natural (🐾🦔🦎). Nunca uses markdown ni asteriscos; texto plano con saltos de línea. Te presentas como Aura.

INFORMACIÓN DE LA CLÍNICA:
- Horario: Lun-Vie 9:00 AM a 7:00 PM, Sábado 9:00 AM a 2:00 PM, Domingo cerrado (pero tú atiendes 24/7).
- Precios de referencia: consulta general $350, consulta exóticos $450, vacunación desde $280, desparasitación desde $200, estética desde $250. El doctor confirma el total en la revisión.
- Servicios: consulta, vacunación, desparasitación, cirugía menor, estética, atención especializada de exóticos, venta de alimento especializado.

URGENCIAS: si describen un animal enfermo/decaído/que no come, muestra empatía, da UN consejo seguro específico de la especie (conejo que no come = urgente por estasis; hurón sin comer = revisión pronto por metabolismo rápido; reptil sin apetito = revisar temperatura/UVB; ave decaída = urgente, ocultan la enfermedad; erizo frío = mantenerlo tibio) y captura la solicitud cuanto antes. NUNCA des diagnósticos ni mediques.

CAPTURA DE SOLICITUD — tu objetivo es capturar al cliente. Flujo natural, UNA pregunta a la vez:
1) nombre de la mascota, 2) especie (si no la sabes), 3) nombre del dueño, 4) número de WhatsApp o teléfono para confirmarle, 5) día y hora que le acomodan (respuesta libre, ej. "mañana temprano").
NO confirmas citas tú misma: registras la solicitud y LA CLÍNICA le confirma.

CUANDO TENGAS LOS 5 DATOS, tu mensaje debe: (a) resumir cálidamente la solicitud y decir que la clínica le confirma por este medio en breve, y (b) terminar con una línea EXACTA en este formato (el sistema la procesa y no se muestra al cliente):
[LEAD]{"pet":"NombreMascota","species":"Especie","owner":"NombreDueño","phone":"telefono","horario":"preferencia de día/hora","motivo":"motivo breve","urgente":true/false}

Si preguntan algo fuera del ámbito de la clínica, redirige amablemente. Nunca inventes servicios ni precios distintos a los listados.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length)
      return res.status(400).json({ error: "messages requerido" });
    if (messages.length > 40)
      return res.status(429).json({ error: "Límite de la sesión demo alcanzado" });

    // Solo roles válidos y contenido corto (protección básica)
    const clean = messages
      .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));

    let reply = null;

    if (process.env.ANTHROPIC_API_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "claude-haiku-4-5",
          max_tokens: 400,
          system: SYSTEM,
          messages: clean,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || "Error Anthropic " + r.status);
      reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");

    } else if (process.env.OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          max_tokens: 400,
          messages: [{ role: "system", content: SYSTEM }, ...clean],
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || "Error OpenAI " + r.status);
      reply = data.choices?.[0]?.message?.content || "";

    } else {
      return res.status(503).json({ error: "Sin API key configurada (ANTHROPIC_API_KEY u OPENAI_API_KEY)" });
    }

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
