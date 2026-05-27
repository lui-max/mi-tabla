import { useState, useEffect } from "react";

const filaVacia = () => ({ a: "", b: "", c: "" });

export default function DataTable({ onVerHistorial }) {
  const [fecha, setFecha] = useState(() => localStorage.getItem("fecha") || "");
  const [encargado, setEncargado] = useState(() => localStorage.getItem("encargado") || "");
  const [talonarios, setTalonarios] = useState(() => {
    const g = localStorage.getItem("talonarios");
    return g ? JSON.parse(g) : [filaVacia(), filaVacia(), filaVacia()];
  });
  const [juegos, setJuegos] = useState(() => {
    const g = localStorage.getItem("juegos");
    return g ? JSON.parse(g) : [
      { juego: "MIXTO",     responsable: "Luis",  tickets: "", tickets6: "" },
      { juego: "LABERINTO", responsable: "Yonny", tickets: "", tickets6: "" },
      { juego: "SALTARINA", responsable: "Yonny", tickets: "", tickets6: "" },
    ];
  });
  const [obs, setObs] = useState(() => {
    const g = localStorage.getItem("obs");
    return g ? JSON.parse(g) : [{ a: "", b: "" }, { a: "", b: "" }];
  });
  const [fulbito, setFulbito] = useState(() => 
     localStorage.getItem("fulbito") || "");

  useEffect(() => { localStorage.setItem("fecha", fecha); }, [fecha]);
  useEffect(() => { localStorage.setItem("encargado", encargado); }, [encargado]);
  useEffect(() => { localStorage.setItem("talonarios", JSON.stringify(talonarios)); }, [talonarios]);
  useEffect(() => { localStorage.setItem("juegos", JSON.stringify(juegos)); }, [juegos]);
  useEffect(() => { localStorage.setItem("obs", JSON.stringify(obs)); }, [obs]);
  useEffect(() => { localStorage.setItem("fulbito", fulbito); }, [fulbito]);

  const actualizarTalonario = (i, campo, valor) => {
    const n = [...talonarios]; n[i] = { ...n[i], [campo]: valor }; setTalonarios(n);
  };
  const actualizarTickets = (i, valor) => {
    const n = [...juegos]; n[i] = { ...n[i], tickets: valor }; setJuegos(n);
  };
  const actualizarTickets6 = (i, valor) => {
    const n = [...juegos]; n[i] = { ...n[i], tickets6: valor }; setJuegos(n);
  };
  const actualizarObs = (i, campo, valor) => {
    const n = [...obs]; n[i] = { ...n[i], [campo]: valor }; setObs(n);
  };

  const limpiarTodo = () => {
    localStorage.clear();
    setFecha("");
    setEncargado("");
    setFulbito("");
    setTalonarios([filaVacia(), filaVacia(), filaVacia()]);
    setJuegos([
      { juego: "MIXTO",     responsable: "Luis",  tickets: "", tickets6: "" },
      { juego: "LABERINTO", responsable: "Yonny", tickets: "", tickets6: "" },
      { juego: "SALTARINA", responsable: "Yonny", tickets: "", tickets6: "" },
    ]);
    setObs([{ a: "", b: "" }, { a: "", b: "" }]);
  };

  const guardarDia = async () => {
    try {
      const { db } = await import("../firebase");
      const { collection, addDoc, updateDoc, getDocs, query, where, serverTimestamp } = await import("firebase/firestore");

      if (!fecha) { alert("⚠️ Ingresa la fecha antes de guardar"); return; }

      const q = query(collection(db, "registros"), where("fecha", "==", fecha));
      const snap = await getDocs(q);

      const datos = {
  fecha,
  encargado,
  talonarios: JSON.parse(JSON.stringify(talonarios)),
  juegos: JSON.parse(JSON.stringify(juegos)),
  obs: JSON.parse(JSON.stringify(obs)),
  fulbito: fulbito || "0.00",
  totalTickets,
  totalImporte,
  yape: yape.toFixed(2),
  queda,
  creadoAt: serverTimestamp()
};

      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, datos);
        alert("✅ Registro actualizado");
      } else {
        await addDoc(collection(db, "registros"), datos);
        alert("✅ Registro guardado");
      }
    } catch(e) {
      alert("❌ Error: " + e.message);
    }
  };

  const calcTal = (t) => {
    const b = parseInt(t.b), c = parseInt(t.c);
    return (!isNaN(b) && !isNaN(c) && c >= b) ? c - b + 1 : null;
  };

  const calcObs = (o) => {
    const a = parseFloat(o.a), b = parseFloat(o.b);
    if (isNaN(a) || isNaN(b)) return "0.00";
    return Math.abs(b - a).toFixed(2);
  };

  const totalTickets7 = juegos.reduce((s, r) => s + (parseInt(r.tickets) || 0), 0);
  const totalTickets6 = juegos.reduce((s, r) => s + (parseInt(r.tickets6) || 0), 0);
  const totalTickets = totalTickets7 + totalTickets6;
  const totalTalonarios = talonarios.reduce((s, t) => s + (calcTal(t) || 0), 0);
  const coincide = totalTalonarios === totalTickets && totalTickets > 0;
  const totalImporte = juegos.reduce((s, r) => s + (parseInt(r.tickets)||0)*7 + (parseInt(r.tickets6)||0)*6, 0);
  const yape = parseFloat(calcObs(obs[0])) + parseFloat(calcObs(obs[1]));
  const queda = (totalImporte - yape).toFixed(2);

  const s = {
    page: { minHeight:"100vh", background:"#e8e0d0", padding:"10px 8px", fontFamily:"'Courier New',monospace", boxSizing:"border-box" },
    card: { background:"#fff", border:"2px solid #1a1a2e", borderRadius:4, marginBottom:10, overflow:"hidden", boxShadow:"3px 3px 0 #1a1a2e" },
    secTitle: { fontSize:10, fontWeight:700, background:"#1a1a2e", color:"#fff", padding:"4px 10px", display:"block", letterSpacing:"0.08em" },
    label: { fontSize:10, fontWeight:700, color:"#888", marginBottom:2 },
    inp: { border:"none", borderBottom:"1px solid #bbb", background:"transparent", fontFamily:"'Courier New',monospace", outline:"none", color:"#1a1a2e", width:"100%", padding:"2px 0", fontSize:14, fontWeight:700 },
  };

  return (
    <div style={s.page}>

      {/* FECHA Y ENCARGADO */}
      <div style={s.card}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"2px solid #1a1a2e"}}>
          <div style={{padding:"8px 10px", borderRight:"1px solid #ccc"}}>
            <div style={s.label}>FECHA</div>
            <input value={fecha} onChange={e=>setFecha(e.target.value)} placeholder="dd/mm/aa" style={{...s.inp}} />
          </div>
          <div style={{padding:"8px 10px"}}>
            <div style={s.label}>ENCARGADO</div>
            <input value={encargado} onChange={e=>setEncargado(e.target.value)} placeholder="Nombre" style={{...s.inp}} />
          </div>
        </div>
        <span style={s.secTitle}>TALONARIOS COSTA</span>
        {talonarios.map((t, i) => {
          const total = calcTal(t);
          return (
            <div key={i} style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:6, padding:"6px 10px", borderBottom:"1px solid #eee", alignItems:"center"}}>
              <div>
                <div style={s.label}># TALONARIO</div>
                <input placeholder="000" value={t.a} onChange={e=>actualizarTalonario(i,"a",e.target.value)} style={{...s.inp}} />
              </div>
              <div>
                <div style={s.label}>INICIO</div>
                <input placeholder="00000" value={t.b} onChange={e=>actualizarTalonario(i,"b",e.target.value)} style={{...s.inp}} />
              </div>
              <div>
                <div style={s.label}>FIN</div>
                <input placeholder="00000" value={t.c} onChange={e=>actualizarTalonario(i,"c",e.target.value)} style={{...s.inp}} />
              </div>
              <div style={{textAlign:"center", minWidth:36}}>
                <div style={s.label}>TOTAL</div>
                <span style={{fontSize:14, fontWeight:700, color:total!==null?(coincide?"#16a34a":"#1a1a2e"):"#aaa"}}>
                  {total !== null ? total : "-"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* JUEGOS */}
      <div style={s.card}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 55px 55px 75px", background:"#1a1a2e"}}>
          {["JUEGO","RESPONSABLE","T×7","T×6","IMPORTE"].map(h=>(
            <div key={h} style={{fontSize:9, fontWeight:700, color:"#fff", padding:"5px 6px", borderRight:"1px solid #333", textAlign:"center"}}>{h}</div>
          ))}
        </div>
        {juegos.map((row, i) => {
          const t7 = parseInt(row.tickets) || 0;
          const t6 = parseInt(row.tickets6) || 0;
          const importe = t7 * 7 + t6 * 6;
          return (
            <div key={i} style={{display:"grid", gridTemplateColumns:"1fr 1fr 55px 55px 75px", background:i%2===0?"#fff":"#f5f2ec", borderBottom:"1px solid #eee"}}>
              <div style={{padding:"6px 6px", fontSize:13, fontWeight:700, borderRight:"1px solid #eee"}}>{row.juego}</div>
              <div style={{padding:"4px 6px", borderRight:"1px solid #eee"}}>
                <input value={row.responsable}
                  onChange={e=>{const n=[...juegos];n[i]={...n[i],responsable:e.target.value};setJuegos(n);}}
                  style={{...s.inp, fontSize:13, fontWeight:600}} />
              </div>
              <div style={{padding:"4px 4px", borderRight:"1px solid #eee", textAlign:"center"}}>
                <input value={row.tickets} onChange={e=>actualizarTickets(i,e.target.value)}
                  placeholder="0" style={{...s.inp, textAlign:"center", fontSize:14}} />
              </div>
              <div style={{padding:"4px 4px", borderRight:"1px solid #eee", textAlign:"center"}}>
                <input value={row.tickets6} onChange={e=>actualizarTickets6(i,e.target.value)}
                  placeholder="0" style={{...s.inp, textAlign:"center", fontSize:14}} />
              </div>
              <div style={{padding:"6px 6px", fontSize:13, textAlign:"right", fontWeight:700}}>
                {importe > 0 ? importe.toFixed(2) : "0.00"}
              </div>
            </div>
          );
        })}
        {[0,1].map(i=>(
          <div key={"e"+i} style={{display:"grid", gridTemplateColumns:"1fr 1fr 55px 55px 75px", borderBottom:"1px solid #eee"}}>
            <div style={{padding:"10px 6px", borderRight:"1px solid #eee"}}></div>
            <div style={{borderRight:"1px solid #eee"}}></div>
            <div style={{borderRight:"1px solid #eee"}}></div>
            <div style={{borderRight:"1px solid #eee"}}></div>
            <div></div>
          </div>
        ))}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 55px 55px 75px", background:"#f1f5f9", borderTop:"2px solid #1a1a2e"}}>
          <div style={{padding:"6px 6px", fontSize:10, fontWeight:700, color:"#888", gridColumn:"1/3"}}>TOTAL</div>
          <div style={{padding:"6px 4px", fontSize:13, fontWeight:700, textAlign:"center", borderLeft:"1px solid #ccc", color:coincide?"#16a34a":"#1a1a2e"}}>{totalTickets7||""}</div>
          <div style={{padding:"6px 4px", fontSize:13, fontWeight:700, textAlign:"center", borderLeft:"1px solid #ccc"}}>{totalTickets6||""}</div>
          <div style={{padding:"6px 6px", fontSize:13, fontWeight:700, textAlign:"right", borderLeft:"1px solid #ccc"}}>{totalImporte>0?totalImporte.toFixed(2):""}</div>
        </div>
      </div>

      {/* OBSERVACIONES */}
      <div style={s.card}>
        <span style={s.secTitle}>OBSERVACIONES</span>
        {[0,1].map(i=>{
          const r = calcObs(obs[i]);
          return (
            <div key={i} style={{display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:6, padding:"8px 10px", borderBottom:i===0?"1px solid #eee":"none", alignItems:"center"}}>
              <div>
                <div style={s.label}>{i===0?"INICIO":"YAPE INI."}</div>
                <input value={obs[i].a} onChange={e=>actualizarObs(i,"a",e.target.value)}
                  placeholder="0.00" style={{...s.inp}} />
              </div>
              <div>
                <div style={s.label}>{i===0?"GASTO":"YAPE FIN"}</div>
                <input value={obs[i].b} onChange={e=>actualizarObs(i,"b",e.target.value)}
                  placeholder="0.00" style={{...s.inp}} />
              </div>
              <div style={{textAlign:"center", minWidth:60}}>
                <div style={s.label}>RESULT.</div>
                <span style={{fontSize:13, fontWeight:700, color:"#1a1a2e"}}>{r}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RESUMEN */}
      <div style={s.card}>
        <span style={s.secTitle}>RESUMEN DEL DÍA</span>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr"}}>
          <div style={{padding:"10px 8px", borderRight:"1px solid #eee", textAlign:"center"}}>
            <div style={s.label}>TOTAL VENDIDO</div>
            <div style={{fontSize:11, color:"#555"}}>{totalTickets7}×S/7 + {totalTickets6}×S/6</div>
            <div style={{fontSize:16, fontWeight:700, color:"#1a1a2e"}}>S/{totalImporte.toFixed(2)}</div>
          </div>
          <div style={{padding:"10px 8px", borderRight:"1px solid #eee", textAlign:"center"}}>
            <div style={s.label}>YAPE</div>
            <div style={{fontSize:16, fontWeight:700, color:"#1a1a2e"}}>S/{yape.toFixed(2)}</div>
          </div>
          <div style={{padding:"10px 8px", textAlign:"center"}}>
            <div style={s.label}>QUEDA</div>
            <div style={{fontSize:16, fontWeight:700, color:"#dc2626"}}>S/{queda}</div>
          </div>
        </div>
      </div>

      {/* FULBITO COSTA */}
<div style={s.card}>
  <span style={s.secTitle}>FULBITO COSTA</span>
  <div style={{padding:"12px 10px"}}>
    <div style={s.label}>INGRESO DEL DIA</div>
    <div style={{display:"flex", alignItems:"center", gap:8, marginTop:4}}>
      <span style={{fontSize:16, fontWeight:700}}>S/</span>
      <input
        value={fulbito}
        onChange={e=>setFulbito(e.target.value)}
        placeholder="0.00"
        style={{...s.inp, fontSize:18, fontWeight:700, width:"100%"}}
      />
    </div>
  </div>
</div>

      {/* BOTONES FIREBASE */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <button
          onClick={guardarDia}
          style={{padding:"12px",background:"#16a34a",color:"#fff",border:"none",fontWeight:700,fontFamily:"'Courier New',monospace",cursor:"pointer",borderRadius:4,fontSize:13,boxShadow:"3px 3px 0 #14532d"}}
        >
          💾 GUARDAR DÍA
        </button>
        <button
          onClick={() => onVerHistorial()}
          style={{padding:"12px",background:"#1a1a2e",color:"#fff",border:"none",fontWeight:700,fontFamily:"'Courier New',monospace",cursor:"pointer",borderRadius:4,fontSize:13,boxShadow:"3px 3px 0 #000"}}
        >
          📋 HISTORIAL
        </button>
      </div>

      {/* BOTÓN LIMPIAR */}
      <button onClick={()=>{
        if(window.confirm("¿Borrar todos los datos del día?")) limpiarTodo();
      }} style={{width:"100%",padding:"12px",background:"#dc2626",color:"#fff",border:"none",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:13,cursor:"pointer",borderRadius:4,boxShadow:"3px 3px 0 #7f1d1d"}}>
        🗑️ LIMPIAR PARA NUEVO DÍA
      </button>

    </div>
  );
}