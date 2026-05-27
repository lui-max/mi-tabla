import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";

// Parsear fecha dd/mm/aa o dd/mm/yyyy
const parseFecha = (f) => {
  if (!f) return null;
  const p = f.split("/");
  if (p.length !== 3) return null;
  const d = parseInt(p[0]);
  const m = parseInt(p[1]) - 1;
  let y = parseInt(p[2]);
  if (y < 100) y += 2000;
  return new Date(y, m, d);
};

const getLunes = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

const getMes = (date) => {
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return meses[date.getMonth()] + " " + date.getFullYear();
};

const getAnio = (date) => String(date.getFullYear());

export default function Historial({ onVolver }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tab, setTab] = useState("diario");

  useEffect(() => {
    const cargar = async () => {
      try {
        const q = query(collection(db, "registros"), orderBy("creadoAt", "desc"));
        const snap = await getDocs(q);
        setRegistros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) {
        alert("Error cargando: " + e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const borrarRegistro = async (id, fecha) => {
    if (!window.confirm("Borrar registro del " + fecha + "?")) return;
    try {
      await deleteDoc(doc(db, "registros", id));
      setRegistros(prev => prev.filter(x => x.id !== id));
      alert("Registro eliminado");
    } catch(e) {
      alert("Error: " + e.message);
    }
  };

  // Agrupar registros
  const agrupar = (clave) => {
    const grupos = {};
    registros.forEach(r => {
      const fecha = parseFecha(r.fecha);
      if (!fecha) return;
      let key = "";
      if (clave === "semana") key = getLunes(fecha);
      else if (clave === "mes") key = getMes(fecha);
      else if (clave === "anio") key = getAnio(fecha);
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(r);
    });
    return grupos;
  };

  const resumenGrupo = (lista) => {
    const totalVendido = lista.reduce((s, r) => s + (Number(r.totalImporte) || 0), 0);
    const totalYape = lista.reduce((s, r) => s + (parseFloat(r.yape) || 0), 0);
    const totalQueda = lista.reduce((s, r) => s + (parseFloat(r.queda) || 0), 0);
    const totalTickets = lista.reduce((s, r) => s + (Number(r.totalTickets) || 0), 0);
    return { totalVendido, totalYape, totalQueda, totalTickets, dias: lista.length };
  };

  const s = {
    page: { minHeight:"100vh", background:"#e8e0d0", padding:"10px 8px", fontFamily:"'Courier New',monospace", boxSizing:"border-box" },
    card: { background:"#fff", border:"2px solid #1a1a2e", borderRadius:4, marginBottom:10, overflow:"hidden", boxShadow:"3px 3px 0 #1a1a2e" },
    secTitle: { fontSize:10, fontWeight:700, background:"#1a1a2e", color:"#fff", padding:"4px 10px", display:"block" },
    label: { fontSize:10, fontWeight:700, color:"#888", marginBottom:2 },
    val: { fontSize:14, fontWeight:700, color:"#1a1a2e" },
  };

  const tabs = ["diario", "semanal", "mensual", "anual"];
  const tabLabels = { diario:"DIARIO", semanal:"SEMANAL", mensual:"MENSUAL", anual:"ANUAL" };

  const registrosFiltrados = registros.filter(r =>
    !busqueda || (r.fecha && r.fecha.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div style={s.page}>
      <button onClick={onVolver} style={{marginBottom:12,padding:"10px",background:"#1a1a2e",color:"#fff",border:"none",fontFamily:"'Courier New',monospace",fontWeight:700,cursor:"pointer",borderRadius:4,width:"100%",fontSize:13}}>
        VOLVER
      </button>

      <h2 style={{fontSize:13,fontWeight:700,marginBottom:8,letterSpacing:"0.08em"}}>HISTORIAL DE REGISTROS</h2>

      {/* TABS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",marginBottom:12,border:"2px solid #1a1a2e",borderRadius:4,overflow:"hidden"}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"8px 4px",fontSize:10,fontWeight:700,border:"none",borderRight:"1px solid #1a1a2e",cursor:"pointer",fontFamily:"'Courier New',monospace",background:tab===t?"#1a1a2e":"#fff",color:tab===t?"#fff":"#1a1a2e",letterSpacing:"0.05em"}}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {cargando && <p>Cargando...</p>}

      {/* DIARIO */}
      {tab === "diario" && (
        <>
          <input type="text" placeholder="Buscar por fecha (ej: 25/05/26)"
            value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            style={{width:"100%",padding:"10px",border:"2px solid #1a1a2e",borderRadius:4,fontFamily:"'Courier New',monospace",fontSize:13,marginBottom:12,boxSizing:"border-box",outline:"none"}}
          />
          {registrosFiltrados.map(r => {
            const total7 = (r.juegos||[]).reduce((s,row)=>s+(parseInt(row.tickets)||0),0);
            const total6 = (r.juegos||[]).reduce((s,row)=>s+(parseInt(row.tickets6)||0),0);
            return (
              <div key={r.id} style={{marginBottom:20}}>
                <div style={s.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#1a1a2e",padding:"4px 10px"}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>📅 {r.fecha} — {r.encargado}</span>
                    <button onClick={()=>borrarRegistro(r.id,r.fecha)}
                      style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:4,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Courier New',monospace"}}>
                      BORRAR
                    </button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"2px solid #1a1a2e"}}>
                    <div style={{padding:"8px 10px",borderRight:"1px solid #ccc"}}>
                      <div style={s.label}>FECHA</div><div style={s.val}>{r.fecha}</div>
                    </div>
                    <div style={{padding:"8px 10px"}}>
                      <div style={s.label}>ENCARGADO</div><div style={s.val}>{r.encargado}</div>
                    </div>
                  </div>
                  <span style={s.secTitle}>TALONARIOS COSTA</span>
                  {(r.talonarios||[]).map((t,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:6,padding:"6px 10px",borderBottom:"1px solid #eee",alignItems:"center"}}>
                      <div><div style={s.label}># TALONARIO</div><div style={s.val}>{t.a||"-"}</div></div>
                      <div><div style={s.label}>INICIO</div><div style={s.val}>{t.b||"-"}</div></div>
                      <div><div style={s.label}>FIN</div><div style={s.val}>{t.c||"-"}</div></div>
                      <div style={{textAlign:"center",minWidth:36}}>
                        <div style={s.label}>TOTAL</div>
                        <div style={{fontSize:14,fontWeight:700,color:"#16a34a"}}>
                          {t.b&&t.c?Math.abs(parseInt(t.c)-parseInt(t.b))+1:"-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 55px 55px 75px",background:"#1a1a2e"}}>
                    {["JUEGO","RESPONSABLE","T×7","T×6","IMPORTE"].map(h=>(
                      <div key={h} style={{fontSize:9,fontWeight:700,color:"#fff",padding:"5px 6px",borderRight:"1px solid #333",textAlign:"center"}}>{h}</div>
                    ))}
                  </div>
                  {(r.juegos||[]).map((row,i)=>{
                    const t7=parseInt(row.tickets)||0;
                    const t6=parseInt(row.tickets6)||0;
                    return (
                      <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 55px 55px 75px",background:i%2===0?"#fff":"#f5f2ec",borderBottom:"1px solid #eee"}}>
                        <div style={{padding:"6px 6px",fontSize:13,fontWeight:700,borderRight:"1px solid #eee"}}>{row.juego}</div>
                        <div style={{padding:"6px 6px",fontSize:13,borderRight:"1px solid #eee"}}>{row.responsable}</div>
                        <div style={{padding:"6px 4px",fontSize:13,textAlign:"center",borderRight:"1px solid #eee"}}>{t7||""}</div>
                        <div style={{padding:"6px 4px",fontSize:13,textAlign:"center",borderRight:"1px solid #eee"}}>{t6||""}</div>
                        <div style={{padding:"6px 6px",fontSize:13,textAlign:"right",fontWeight:700}}>{(t7*7+t6*6).toFixed(2)}</div>
                      </div>
                    );
                  })}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 55px 55px 75px",background:"#f1f5f9",borderTop:"2px solid #1a1a2e"}}>
                    <div style={{padding:"6px 6px",fontSize:10,fontWeight:700,color:"#888",gridColumn:"1/3"}}>TOTAL</div>
                    <div style={{padding:"6px 4px",fontSize:13,fontWeight:700,textAlign:"center",borderLeft:"1px solid #ccc",color:"#16a34a"}}>{total7||""}</div>
                    <div style={{padding:"6px 4px",fontSize:13,fontWeight:700,textAlign:"center",borderLeft:"1px solid #ccc"}}>{total6||""}</div>
                    <div style={{padding:"6px 6px",fontSize:13,fontWeight:700,textAlign:"right",borderLeft:"1px solid #ccc"}}>{r.totalImporte?Number(r.totalImporte).toFixed(2):""}</div>
                  </div>
                </div>
                <div style={s.card}>
                  <span style={s.secTitle}>OBSERVACIONES</span>
                  {(r.obs||[]).map((o,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,padding:"8px 10px",borderBottom:i===0?"1px solid #eee":"none",alignItems:"center"}}>
                      <div><div style={s.label}>{i===0?"INICIO":"YAPE INI."}</div><div style={s.val}>{o.a||"0.00"}</div></div>
                      <div><div style={s.label}>{i===0?"GASTO":"YAPE FIN"}</div><div style={s.val}>{o.b||"0.00"}</div></div>
                      <div style={{textAlign:"center",minWidth:60}}>
                        <div style={s.label}>RESULT.</div>
                        <div style={{fontSize:13,fontWeight:700}}>{o.a&&o.b?Math.abs(parseFloat(o.b)-parseFloat(o.a)).toFixed(2):"0.00"}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <span style={s.secTitle}>RESUMEN DEL DIA</span>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
                    <div style={{padding:"10px 8px",borderRight:"1px solid #eee",textAlign:"center"}}>
                      <div style={s.label}>TOTAL VENDIDO</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#16a34a"}}>S/{r.totalImporte?Number(r.totalImporte).toFixed(2):"0.00"}</div>
                    </div>
                    <div style={{padding:"10px 8px",borderRight:"1px solid #eee",textAlign:"center"}}>
                      <div style={s.label}>YAPE</div>
                      <div style={{fontSize:16,fontWeight:700}}>S/{r.yape||"0.00"}</div>
                    </div>
                      <div style={{padding:"10px 8px",textAlign:"center"}}>
                      <div style={s.label}>QUEDA</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#dc2626"}}>S/{r.queda||"0.00"}</div>
                    </div>
                  </div>
                  <div style={{padding:"10px 8px",borderRight:"1px solid #eee",textAlign:"center"}}>
                      <div style={s.label}>FULBITO</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#2563eb"}}>S/{r.fulbito || "0.00"}</div>
                </div>
                </div>
              </div>
            );
          })}
          {!cargando && registrosFiltrados.length===0 && (
            <p style={{textAlign:"center",color:"#888"}}>
              {busqueda?"No hay registros para "+busqueda:"No hay registros aun"}
            </p>
          )}
        </>
      )}

      {/* SEMANAL / MENSUAL / ANUAL */}
      {["semanal","mensual","anual"].includes(tab) && (
        <>
          {Object.entries(agrupar(tab==="semanal"?"semana":tab==="mensual"?"mes":"anio"))
            .sort((a,b)=>b[0].localeCompare(a[0]))
            .map(([key, lista]) => {
              const res = resumenGrupo(lista);
              const titulo = tab==="semanal" ? "Semana del " + key : key;
              return (
                <div key={key} style={s.card}>
                  <span style={s.secTitle}>{titulo} — {res.dias} dia{res.dias!==1?"s":""}</span>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"10px 8px"}}>
                    <div style={{textAlign:"center",borderRight:"1px solid #eee"}}>
                      <div style={s.label}>TICKETS</div>
                      <div style={{fontSize:15,fontWeight:700}}>{res.totalTickets}</div>
                    </div>
                    <div style={{textAlign:"center",borderRight:"1px solid #eee"}}>
                      <div style={s.label}>VENDIDO</div>
                      <div style={{fontSize:15,fontWeight:700,color:"#16a34a"}}>S/{res.totalVendido.toFixed(2)}</div>
                    </div>
                    <div style={{textAlign:"center",borderRight:"1px solid #eee"}}>
                      <div style={s.label}>YAPE</div>
                      <div style={{fontSize:15,fontWeight:700}}>S/{res.totalYape.toFixed(2)}</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={s.label}>QUEDA</div>
                      <div style={{fontSize:15,fontWeight:700,color:"#dc2626"}}>S/{res.totalQueda.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{borderTop:"1px solid #eee"}}>
  {/* Desglose por juego */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 55px 55px 75px",background:"#f8f8f8"}}>
    {["JUEGO","T×7","T×6","IMPORTE"].map(h=>(
      <div key={h} style={{fontSize:9,fontWeight:700,color:"#888",padding:"4px 6px",borderRight:"1px solid #eee",textAlign:"center"}}>{h}</div>
    ))}
  </div>
  {["MIXTO","LABERINTO","SALTARINA"].map(juego=>{
    const t7 = lista.reduce((s,r)=>{
      const j = (r.juegos||[]).find(x=>x.juego===juego);
      return s + (parseInt(j?.tickets)||0);
    },0);
    const t6 = lista.reduce((s,r)=>{
      const j = (r.juegos||[]).find(x=>x.juego===juego);
      return s + (parseInt(j?.tickets6)||0);
    },0);
    const imp = t7*7 + t6*6;
    return (
      <div key={juego} style={{display:"grid",gridTemplateColumns:"1fr 55px 55px 75px",borderBottom:"1px solid #eee"}}>
        <div style={{padding:"5px 6px",fontSize:12,fontWeight:700,borderRight:"1px solid #eee"}}>{juego}</div>
        <div style={{padding:"5px 4px",fontSize:12,textAlign:"center",borderRight:"1px solid #eee"}}>{t7||""}</div>
        <div style={{padding:"5px 4px",fontSize:12,textAlign:"center",borderRight:"1px solid #eee"}}>{t6||""}</div>
        <div style={{padding:"5px 6px",fontSize:12,textAlign:"right",fontWeight:700}}>{imp>0?imp.toFixed(2):""}</div>
      </div>
    );
  })}
  <div style={{padding:"6px 10px"}}>
    <div style={s.label}>DIAS: {lista.map(r=>r.fecha).join(" | ")}</div>
  </div>
</div>
                </div>
              );
          })}
          {!cargando && Object.keys(agrupar(tab==="semanal"?"semana":tab==="mensual"?"mes":"anio")).length===0 && (
            <p style={{textAlign:"center",color:"#888"}}>No hay registros aun</p>
          )}
        </>
      )}
    </div>
  );
}