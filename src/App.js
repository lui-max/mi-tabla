import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

import DataTable from "./components/DataTable";
import Historial from "./pages/Historial";
import Login from "./components/Login";

function App() {
  const [vista, setVista] = useState("tabla");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Cargando...</p>;

  if (!user) {
    return <Login />;
  }

  return vista === "tabla"
    ? <DataTable onVerHistorial={() => setVista("historial")} />
    : <Historial onVolver={() => setVista("tabla")} />;
}

export default App;