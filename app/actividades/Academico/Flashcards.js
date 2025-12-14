import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ======================= CONFIG ======================= */
const BASE_URL = "http://192.168.18.40:5000"; // Cambia según tu red

/* ======================= COLORES ======================= */
const lightColors = {
  background: "#f7f7f7",
  title: "#4A00E0",
  subtitle: "#555",
  card: "#fff",
  cardTitle: "#6A5AE0",
  cardText: "#444",
  button: "#1e90ff",
  buttonText: "#fff",
};

/* ======================= ESTILOS ======================= */
const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 60,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 25,
      color: theme.title,
    },
    card: {
      backgroundColor: theme.card,
      padding: 20,
      borderRadius: 15,
      elevation: 4,
      marginBottom: 20,
    },
    pregunta: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
      color: theme.cardText,
    },
    respuesta: { fontSize: 18, marginBottom: 15, color: theme.subtitle },
    btnVer: { backgroundColor: theme.button, padding: 12, borderRadius: 8 },
    btnText: {
      textAlign: "center",
      fontSize: 16,
      color: theme.buttonText,
      fontWeight: "bold",
    },
    bottom: { flexDirection: "row", marginBottom: 20 },
    btn: { padding: 15, borderRadius: 10, flex: 1, marginHorizontal: 5 },
    correcto: { backgroundColor: "#4CAF50" },
    incorrecto: { backgroundColor: "#E53935" },
    progreso: {
      textAlign: "center",
      fontSize: 16,
      marginTop: 5,
      color: theme.cardText,
    },
    aciertos: {
      textAlign: "center",
      fontSize: 18,
      marginTop: 10,
      fontWeight: "bold",
      color: theme.cardTitle,
    },
    input: {
      backgroundColor: "#eee",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      color: "#000",
    },
    sectionButton: {
      backgroundColor: theme.button,
      padding: 12,
      borderRadius: 8,
      width: "70%",
      alignSelf: "center",
      marginTop: 20,
    },
    iconBtn: { marginLeft: 12 },
    icon: { fontSize: 22 },
  });

/* ======================= COMPONENTE ======================= */
export default function Flashcards() {
  const theme = lightColors;
  const s = styles(theme);

  /* ---------- FLASHCARDS POR DEFECTO ---------- */
  const defaultPreguntas = [
    { pregunta: "¿Qué es una variable?", respuesta: "Un espacio de memoria." },
    { pregunta: "¿Qué es una célula?", respuesta: "Unidad básica de la vida." },
    { pregunta: "¿Quién descubrió América?", respuesta: "Cristóbal Colón." },
    {
      pregunta: "¿Qué es un mapa mental?",
      respuesta: "Representación gráfica de ideas.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [aciertos, setAciertos] = useState(0);

  /* ---------- FLASHCARDS CREADAS ---------- */
  const [misFlashcards, setMisFlashcards] = useState([]);
  const [mostrarRespuestaCreadas, setMostrarRespuestaCreadas] = useState({});

  /* ---------- FORM ---------- */
  const [crearModo, setCrearModo] = useState(false);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [flashcardEditando, setFlashcardEditando] = useState(null);

  /* ---------- CONTEXTO ---------- */
  const [usuario, setUsuario] = useState(null);
  const [enfoqueId, setEnfoqueId] = useState(null);
  const [actividadId, setActividadId] = useState(null);

  /* ======================= INIT ======================= */
  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("usuario"));
        setUsuario(user);

        const r1 = await fetch(`${BASE_URL}/api/alumno-enfoque/${user.id}`);
        const j1 = await r1.json();
        setEnfoqueId(j1.enfoqueId._id);

        const r2 = await fetch(
          `${BASE_URL}/api/actividades/flashcard/${j1.enfoqueId._id}?usuarioId=${user.id}`
        );
        const act = await r2.json();

        if (act) {
          setActividadId(act._id);
          setMisFlashcards(act.flashcards || []);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar las flashcards.");
        console.log(error);
      }
    };
    init();
  }, []);

  /* ======================= FLASHCARDS POR DEFECTO ======================= */
  const siguiente = async (correcto) => {
    if (correcto) setAciertos((a) => a + 1);
    setMostrarRespuesta(false);

    if (index < defaultPreguntas.length - 1) {
      setIndex(index + 1);
      return;
    }

    if (aciertos + (correcto ? 1 : 0) === defaultPreguntas.length) {
      console.log("✔ Completó flashcards por defecto");
      try {
        const res = await fetch(`${BASE_URL}/api/actividades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: "Flashcards rápidas",
            descripcion: "Actividad predeterminada completada",
            tipo: "flashcard",
            enfoqueId,
            usuarioId: usuario.id,
          }),
        });
        const data = await res.json();
        setActividadId(data.actividad._id);
      } catch (error) {
        console.log("No se pudo crear la actividad predeterminada", error);
      }
    }
  };

  /* ======================= CRUD FLASHCARDS ======================= */
  const guardarFlashcard = async () => {
    if (!nuevaPregunta || !nuevaRespuesta) return;

    try {
      if (!actividadId) {
        Alert.alert("Error", "Actividad no encontrada para agregar flashcard.");
        return;
      }

      if (flashcardEditando) {
        await fetch(
          `${BASE_URL}/api/actividades/${actividadId}/flashcards/${flashcardEditando._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pregunta: nuevaPregunta,
              respuesta: nuevaRespuesta,
            }),
          }
        );

        setMisFlashcards((f) =>
          f.map((x) =>
            x._id === flashcardEditando._id
              ? { ...x, pregunta: nuevaPregunta, respuesta: nuevaRespuesta }
              : x
          )
        );
      } else {
        const res = await fetch(
          `${BASE_URL}/api/actividades/${actividadId}/flashcards`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flashcards: [
                { pregunta: nuevaPregunta, respuesta: nuevaRespuesta },
              ],
            }),
          }
        );
        const data = await res.json();
        setMisFlashcards(data.flashcards);
      }

      setNuevaPregunta("");
      setNuevaRespuesta("");
      setFlashcardEditando(null);
      setCrearModo(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la flashcard.");
      console.log(error);
    }
  };

  const eliminarFlashcard = async (id) => {
    Alert.alert("Eliminar", "¿Eliminar esta flashcard?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await fetch(
              `${BASE_URL}/api/actividades/${actividadId}/flashcards/${id}`,
              { method: "DELETE" }
            );
            setMisFlashcards((f) => f.filter((x) => x._id !== id));
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la flashcard.");
            console.log(error);
          }
        },
      },
    ]);
  };

  /* ======================= RENDER ======================= */
  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>📘 Flashcards</Text>

      {/* FLASHCARDS POR DEFECTO */}
      <View style={s.card}>
        <Text style={s.pregunta}>{defaultPreguntas[index].pregunta}</Text>
        {mostrarRespuesta && (
          <Text style={s.respuesta}>{defaultPreguntas[index].respuesta}</Text>
        )}
        <TouchableOpacity
          style={s.btnVer}
          onPress={() => setMostrarRespuesta(!mostrarRespuesta)}
        >
          <Text style={s.btnText}>
            {mostrarRespuesta ? "Ocultar respuesta" : "Mostrar respuesta"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={s.bottom}>
        <TouchableOpacity
          style={[s.btn, s.correcto]}
          onPress={() => siguiente(true)}
        >
          <Text style={s.btnText}>✔ Lo sabía</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, s.incorrecto]}
          onPress={() => siguiente(false)}
        >
          <Text style={s.btnText}>✖ No lo sabía</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.progreso}>
        Tarjeta {index + 1} / {defaultPreguntas.length}
      </Text>
      <Text style={s.aciertos}>Aciertos: {aciertos}</Text>

      {/* FLASHCARDS CREADAS */}
      {misFlashcards.length > 0 && (
        <>
          <Text style={[s.title, { fontSize: 22, marginTop: 40 }]}>
            📚 Mis Flashcards
          </Text>
          {misFlashcards.map((f) => (
            <View key={f._id} style={s.card}>
              <Text style={s.pregunta}>{f.pregunta}</Text>
              {mostrarRespuestaCreadas[f._id] && (
                <Text style={s.respuesta}>{f.respuesta}</Text>
              )}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  style={[s.btnVer, { flex: 1 }]}
                  onPress={() =>
                    setMostrarRespuestaCreadas((p) => ({
                      ...p,
                      [f._id]: !p[f._id],
                    }))
                  }
                >
                  <Text style={s.btnText}>Mostrar respuesta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.iconBtn}
                  onPress={() => {
                    setFlashcardEditando(f);
                    setNuevaPregunta(f.pregunta);
                    setNuevaRespuesta(f.respuesta);
                    setCrearModo(true);
                  }}
                >
                  <Text style={s.icon}>✏️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.iconBtn}
                  onPress={() => eliminarFlashcard(f._id)}
                >
                  <Text style={s.icon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {/* FORMULARIO CREAR / EDITAR */}
      {crearModo && (
        <View style={{ marginTop: 30 }}>
          <TextInput
            style={s.input}
            placeholder="Pregunta"
            value={nuevaPregunta}
            onChangeText={setNuevaPregunta}
          />
          <TextInput
            style={s.input}
            placeholder="Respuesta"
            value={nuevaRespuesta}
            onChangeText={setNuevaRespuesta}
          />

          <TouchableOpacity style={s.btnVer} onPress={guardarFlashcard}>
            <Text style={s.btnText}>
              {flashcardEditando ? "Actualizar" : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={s.sectionButton}
        onPress={() => setCrearModo((m) => !m)}
      >
        <Text style={s.btnText}>
          {crearModo ? "Cancelar" : "Crear Flashcard"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
