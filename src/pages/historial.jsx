import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Historial({ onVolver }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const q = query(collection(db, "registros"), orderBy("creadoAt", "desc"));
      const snap = await getDocs(q);
      setRegistros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCargando(false);
    };
    cargar();
  }, []);

  const s = {
    page: { minHeight:"100vh", background:"#e8e0d0", padding:"10px 8px", fontFamily:"'Courier New',monospace" },
    card: { background:"#fff", border:"2px solid #1a1a2e", borderRadius:4, marginBottom:10, overflow:"hidden", boxShadow:"3px 3px 0 #1a1a2e" },
    title: { fontSize:10, fontWeight:700, background:"#1a1a2e", color:"#fff", padding:"4px 10px", display:"block" },
  };

  return (
    <div style={s.page}>
      <button onClick={onVolver} style={{marginBottom:12,padding:"8px 16px",background:"#1a1a2e",color:"#fff",border:"none",fontFamily:"'Courier New',monospace",fontWeight:700,cursor:"pointer",borderRadius:4,width:"100%"}}>
        ← VOLVER
      </button>
      <h2 style={{fontSize:14,fontWeight:700,marginBottom:12}}>HISTORIAL DE REGISTROS</h2>

      {cargando && <p>Cargando...</p>}

      {registros.map(r => (
        <div key={r.id} style={s.card}>
          <span style={s.title}>📅 {r.fecha} — {r.encargado}</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"10px 8px"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#888"}}>TOTAL TICKETS</div>
              <div style={{fontSize:16,fontWeight:700}}>{r.totalTickets}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#888"}}>IMPORTE</div>
              <div style={{fontSize:16,fontWeight:700,color:"#16a34a"}}>S/{r.totalImporte}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#888"}}>YAPE</div>
              <div style={{fontSize:16,fontWeight:700}}>S/{r.yape}</div>
            </div>
          </div>
        </div>
      ))}

      {!cargando && registros.length === 0 && (
        <p style={{textAlign:"center",color:"#888"}}>No hay registros aún</p>
      )}
    </div>
  );
}
