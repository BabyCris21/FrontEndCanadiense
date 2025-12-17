import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import MapaMentalGrafico from "../../../components/MapaMentalGrafico";
import MapaMentalZoom from "../../../components/MapaMentalZoom";

const BASE_URL = "http://192.168.18.40:5000";

export default function MapaMental() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nodos, setNodos] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [enfoqueId, setEnfoqueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  /* ===================== INIT ===================== */
  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("usuario"));
        if (!user?.id) return;

        setUsuarioId(user.id);

        const r = await fetch(`${BASE_URL}/api/alumno-enfoque/${user.id}`);
        const j = await r.json();

        if (j?.enfoqueId?._id) {
          setEnfoqueId(j.enfoqueId._id);
        }
      } catch (error) {
        console.log("INIT ERROR", error);
      }
    };

    init();
  }, []);

  /* ===================== NODOS ===================== */
  const agregarNodo = () => {
    setNodos((prev) => [...prev, { titulo: "", descripcion: "" }]);
  };

  const actualizarNodo = (index, campo, valor) => {
    const copia = [...nodos];
    copia[index][campo] = valor;
    setNodos(copia);
  };

  const eliminarNodo = (index) => {
    setNodos((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===================== GUARDAR ===================== */
  const guardarMapaMental = async () => {
    if (!titulo.trim() || nodos.length === 0) {
      Alert.alert("Error", "Agrega un título y al menos un nodo");
      return;
    }

    if (!usuarioId || !enfoqueId) {
      Alert.alert("Error", "Usuario o enfoque no cargado");
      return;
    }

    setLoading(true);

    try {
      const resAct = await fetch(`${BASE_URL}/api/actividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          enfoqueId,
          tipo: "mapa-mental",
          titulo,
          descripcion,
        }),
      });

      const act = await resAct.json();

      if (!act?.actividad?._id) {
        throw new Error("No se creó la actividad");
      }

      const actividadId = act.actividad._id;

      const resNodos = await fetch(
        `${BASE_URL}/api/actividades/${actividadId}/mapa-mental`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodos }),
        }
      );

      if (!resNodos.ok) {
        throw new Error("Error guardando nodos");
      }

      Alert.alert("✔", "Mapa mental guardado correctamente");
      setTitulo("");
      setDescripcion("");
      setNodos([]);
    } catch (error) {
      console.log("ERROR GUARDAR MAPA", error);
      Alert.alert("Error", "No se pudo guardar el mapa mental");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🧠 Mapa Mental</Text>

        <TextInput
          placeholder="Título principal"
          value={titulo}
          onChangeText={setTitulo}
          style={styles.input}
        />

        <TextInput
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.input}
        />

        <Text style={styles.subtitle}>Nodos</Text>

        {nodos.map((nodo, index) => (
          <View key={index} style={styles.card}>
            <TextInput
              placeholder="Subtítulo"
              value={nodo.titulo}
              onChangeText={(v) => actualizarNodo(index, "titulo", v)}
              style={styles.input}
            />

            <TextInput
              placeholder="Información"
              value={nodo.descripcion}
              onChangeText={(v) => actualizarNodo(index, "descripcion", v)}
              style={styles.input}
              multiline
            />

            <TouchableOpacity
              style={styles.delete}
              onPress={() => eliminarNodo(index)}
            >
              <Text style={{ color: "#fff" }}>Eliminar nodo</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.add} onPress={agregarNodo}>
          <Text style={{ color: "#fff" }}>➕ Agregar nodo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.save}
          onPress={guardarMapaMental}
          disabled={loading}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {loading ? "Guardando..." : "Guardar mapa mental"}
          </Text>
        </TouchableOpacity>

        {/* BOTÓN FULLSCREEN */}
        {nodos.length > 0 && (
          <TouchableOpacity
            style={styles.fullscreenBtn}
            onPress={() => setFullscreen(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              🖥 Ver en pantalla completa
            </Text>
          </TouchableOpacity>
        )}

        {/* VISTA PREVIA (VERTICAL) */}
        {nodos.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>
              Vista previa del mapa mental
            </Text>

            <View style={{ height: 400 }}>
              <MapaMentalGrafico titulo={titulo} nodos={nodos} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= FULLSCREEN ================= */}
      <Modal visible={fullscreen} animationType="fade">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setFullscreen(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                ✖ Cerrar
              </Text>
            </TouchableOpacity>

            <MapaMentalZoom>
              <View style={styles.rotatedCanvas}>
                <MapaMentalGrafico titulo={titulo} nodos={nodos} />
              </View>
            </MapaMentalZoom>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  add: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  save: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  delete: {
    backgroundColor: "#E53935",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },

  fullscreenBtn: {
    backgroundColor: "#673AB7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  previewContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#eef6ff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1e90ff",
  },

  previewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#1e90ff",
  },

  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  fullscreenCanvas: {
    flex: 1,
  },

  closeBtn: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "#E53935",
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },

  rotatedCanvas: {
    width: "100%",
    height: "100%",
    transform: [{ rotate: "90deg" }],
  },
});
