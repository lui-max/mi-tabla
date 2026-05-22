import { useState } from "react";
import DataTable from "./components/DataTable";
import Historial from "./pages/Historial";


function App() {
  const [vista, setVista] = useState("tabla");
  return vista === "tabla"
  ? <DataTable onVerHistorial={() => setVista("historial")} />
  : <Historial onVolver={() => setVista("tabla")} />;
}

export default App;