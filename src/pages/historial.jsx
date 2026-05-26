import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, orderBy, query, doc, deleteDoc
} from "firebase/firestore";

export default function Historial({ onVolver }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const q = query(collection(db, "registros"), orderBy("creadoAt", "desc"));
        const snap = await getDocs(q);
        setRegistros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) {
        alert("❌ Error cargando: " + e.message);
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
      alert("✅ Registro eliminado");
    } catch(e) {
      alert("❌ Error: " + e.message);
    }
  };

  const registrosFiltrados = registros.filter(r =>
    !busqueda || (r.fecha && r.fecha.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const s = {
    page: { minHeight:"100vh", background:"#e8e0d0", padding:"10px 8px", fontFamily:"'Courier New',monospace", boxSizing:"border-box" },
    card: { background:"#fff", border:"2px solid #1a1a2e", borderRadius:4, marginBottom:10, overflow:"hidden", boxShadow:"3px 3px 0 #1a1a2e" },
    secTitle: { fontSize:10, fontWeight:700, background:"#1a1a2e", color:"#fff", padding:"4px 10px", display:"block" },
    label: { fontSize:10, fontWeight:700, color:"#888", marginBottom:2 },
    val: { fontSize:14, fontWeight:700, color:"#1a1a2e" },
  };

  return (
    <div style={s.page}>
      <button onClick={onVolver} style={{marginBottom:12,padding:"10px",background:"#1a1a2e",color:"#fff",border:"none",fontFamily:"'Courier New',monospace",fontWeight:700,cursor:"pointer",borderRadius:4,width:"100%",fontSize:13}}>
        ← VOLVER
      </button>

      <h2 style={{fontSize:13,fontWeight:700,marginBottom:8,letterSpacing:"0.08em"}}>HISTORIAL DE REGISTROS</h2>

      <input
        type="text"
        placeholder="Buscar por fecha (ej: 25/05/26)"
        value={busqueda}
        onChange={e=>setBusqueda(e.target.value)}
        style={{width:"100%",padding:"10px",border:"2px solid #1a1a2e",borderRadius:4,fontFamily:"'Courier New',monospace",fontSize:13,marginBottom:12,boxSizing:"border-box",outline:"none"}}
      />

      {cargando && <p>Cargando...</p>}

      {registrosFiltrados.map(r => (
        <div key={r.id} style={{marginBottom:20}}>

          {/* FECHA + ENCARGADO + TALONARIOS */}
          <div style={s.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#1a1a2e",padding:"4px 10px"}}>
              <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>📅 {r.fecha} — {r.encargado}</span>
              <button
                onClick={()=>borrarRegistro(r.id, r.fecha)}
                style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:4,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Courier New',monospace"}}
              >
                🗑️ BORRAR
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"2px solid #1a1a2e"}}>
              <div style={{padding:"8px 10px",borderRight:"1px solid #ccc"}}>
                <div style={s.label}>FECHA</div>
                <div style={s.val}>{r.fecha}</div>
              </div>
              <div style={{padding:"8px 10px"}}>
                <div style={s.label}>ENCARGADO</div>
                <div style={s.val}>{r.encargado}</div>
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
                    {t.b&&t.c ? Math.abs(parseInt(t.c)-parseInt(t.b))+1 : "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* JUEGOS */}
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
                  <div style={{padding:"6px 6px",fontSize:13,textAlign:"right",fontWeight:700}}>{(t7*7+t6*6).toFixed(2)""}</div>
                </div>
              );
            })}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 55px 55px 75px",background:"#f1f5f9",borderTop:"2px solid #1a1a2e"}}>
              <div style={{padding:"6px 6px",fontSize:10,fontWeight:700,color:"#888",gridColumn:"1/3"}}>TOTAL</div>
              <div style={{padding:"6px 4px",fontSize:13,fontWeight:700,textAlign:"center",borderLeft:"1px solid #ccc",color:"#16a34a"}}>{r.totalTickets||""}</div>
              <div style={{padding:"6px 4px",borderLeft:"1px solid #ccc"}}></div>
              <div style={{padding:"6px 6px",fontSize:13,fontWeight:700,textAlign:"right",borderLeft:"1px solid #ccc"}}>{r.totalImporte?Number(r.totalImporte).toFixed(2):""}</div>
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div style={s.card}>
            <span style={s.secTitle}>OBSERVACIONES</span>
            {(r.obs||[]).map((o,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:6,padding:"8px 10px",borderBottom:i===0?"1px solid #eee":"none",alignItems:"center"}}>
                <div>
                  <div style={s.label}>{i===0?"INICIO":"YAPE INI."}</div>
                  <div style={s.val}>{o.a||"0.00"}</div>
                </div>
                <div>
                  <div style={s.label}>{i===0?"GASTO":"YAPE FIN"}</div>
                  <div style={s.val}>{o.b||"0.00"}</div>
                </div>
                <div style={{textAlign:"center",minWidth:60}}>
                  <div style={s.label}>RESULT.</div>
                  <div style={{fontSize:13,fontWeight:700}}>
                    {o.a&&o.b ? Math.abs(parseFloat(o.b)-parseFloat(o.a)).toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div style={s.card}>
            <span style={s.secTitle}>RESUMEN DEL DÍA</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
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
          </div>

        </div>
      ))}

      {!cargando && registrosFiltrados.length===0 && (
        <p style={{textAlign:"center",color:"#888"}}>
          No hay registros{busqueda?` para "${busqueda}"`:" aún"}
        </p>
      )}
    </div>
  );
}