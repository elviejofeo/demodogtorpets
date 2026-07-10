// ============================================================
// DOGTOR PETS — Demo colector + panel de leads (datos ficticios)
// ============================================================

const DP = {
  clinic: { name: "DOGTOR PETS", doctor: "Dr. José Luis Perales", tagline: "Domestic & Exotic Veterinary", city: "Monterrey, N.L." },

  // Leads precargados del "día de hoy"
  leads: [
    { id:"l1", emoji:"🦔", who:"Mariana G.", phone:"81 1234 5634", pet:"Kiwi · Hurón, 2 años",
      what:"Urgencia: no come desde la tarde, decaído. Pide espacio mañana temprano.",
      when:"11:03 PM · fuera de horario", cls:"b-hot", estado:"nuevo" },
    { id:"l2", emoji:"🦜", who:"Roberto M.", phone:"81 2345 6709", pet:"Coco · Perico australiano",
      what:"Pregunta por recorte de alas y revisión general. Prefiere sábado en la mañana.",
      when:"9:41 PM · fuera de horario", cls:"b-cita", estado:"nuevo" },
    { id:"l3", emoji:"🐈", who:"Luis T.", phone:"81 3456 7888", pet:"Nube · Gata, 1 año",
      what:"Preguntó precio de esterilización — información enviada por el asistente.",
      when:"7:52 PM", cls:"b-rec", estado:"contactado" },
    { id:"l4", emoji:"🦎", who:"Paola R.", phone:"81 4567 8951", pet:"Rango · Gecko leopardo",
      what:"Duda de temperatura del terrario — orientado por el asistente, se le sugirió revisión.",
      when:"6:15 PM", cls:"b-cita", estado:"contactado" },
    { id:"l5", emoji:"🐕", who:"Fam. Garza", phone:"81 5678 9087", pet:"Max · Labrador, 4 años",
      what:"Solicitó vacunación a domicilio — se le explicó que es en clínica, aceptó llevarlo.",
      when:"1:20 PM", cls:"b-new", estado:"convertido" },
    { id:"l6", emoji:"👀", who:"Visitante", phone:"", pet:"— · Tortuga",
      what:"Preguntó si atienden tortugas y el horario. No dejó datos — atendido por Aura sin escalar.",
      when:"10:12 PM · fuera de horario", cls:"b-rec", estado:"nuevo", tipo:"curioso" },
    { id:"l7", emoji:"👀", who:"Visitante", phone:"", pet:"— · Perro",
      what:"Preguntó precio de baño y estética. Se le compartió la lista — no dejó datos.",
      when:"4:47 PM", cls:"b-rec", estado:"nuevo", tipo:"curioso" },
  ],
};

// ---------- Supabase: leads en vivo (tabla dogtor_leads) ----------
const SB_URL = "https://myzanwpvtnrznjofmtwh.supabase.co";
const SB_KEY = "sb_publishable_dxKvXVg1nDXUFfj-vwgGFA_cS__ZjZ-";
const SB_H = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json" };

async function sbInsertLead(l){
  const r = await fetch(SB_URL + "/rest/v1/dogtor_leads", {
    method: "POST",
    headers: { ...SB_H, "Prefer": "return=minimal" },
    body: JSON.stringify({ owner:l.owner, pet:l.pet, species:l.species||null, horario:l.horario||null, motivo:l.motivo||null, urgente:!!l.urgente, phone:l.phone||null, estado:"nuevo" })
  });
  if(!r.ok) throw new Error("supabase " + r.status);
}
async function sbUpdateEstado(id, estado){
  const r = await fetch(SB_URL + "/rest/v1/dogtor_leads?id=eq." + id, {
    method: "PATCH",
    headers: { ...SB_H, "Prefer": "return=minimal" },
    body: JSON.stringify({ estado })
  });
  if(!r.ok) throw new Error("supabase " + r.status);
}
async function sbFetchLeads(){
  const r = await fetch(SB_URL + "/rest/v1/dogtor_leads?select=*&order=created_at.desc&limit=50", { headers: SB_H });
  if(!r.ok) throw new Error("supabase " + r.status);
  return r.json();
}

// ---------- Respaldo local (si Supabase no responde) ----------
function dpGetUserLeads(){
  try { return JSON.parse(localStorage.getItem("dp_leads") || "[]"); } catch(e){ return []; }
}
function dpSaveUserLead(l){
  const all = dpGetUserLeads(); all.push(l);
  localStorage.setItem("dp_leads", JSON.stringify(all));
}
function dpResetDemo(){ localStorage.removeItem("dp_leads"); location.reload(); }
