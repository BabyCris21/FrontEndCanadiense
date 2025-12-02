import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

const darkColors = {
  background: "#121212",
  title: "#fff",
  subtitle: "#ccc",
  card: "#1e1e1e",
  cardTitle: "#BB86FC",
  cardText: "#eee",
  button: "#6200ee",
  buttonText: "#fff",
};

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
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
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
    sectionToggle: { marginVertical: 15, alignItems: "center" },
    sectionButton: {
      backgroundColor: theme.button,
      padding: 12,
      borderRadius: 8,
      width: "60%",
    },
    boxFlashcard: {
      backgroundColor: "#f0f0f0",
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    boxPregunta: { fontWeight: "bold", marginBottom: 5 },
    boxRespuesta: { color: "#555" },
  });

export default function Flashcards({ actividadId }) {
  const defaultPreguntas = [
    {
      pregunta: "¿Qué es una variable?",
      respuesta: "Un espacio donde se almacena un valor.",
    },
    {
      pregunta: "¿Qué es una célula?",
      respuesta: "La unidad básica de la vida.",
    },
    {
      pregunta: "¿Quién descubrió América?",
      respuesta: "Cristóbal Colón en 1492.",
    },
    {
      pregunta: "¿Qué es un mapa mental?",
      respuesta: "Una representación gráfica de ideas conectadas.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [misFlashcards, setMisFlashcards] = useState([]);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [crearModo, setCrearModo] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [enfoqueId, setEnfoqueId] = useState(null);

  const darkMode = false;
  const theme = darkMode ? darkColors : lightColors;
  const s = styles(theme);

  const todasPreguntas = defaultPreguntas;

  useEffect(() => {
    const cargarUsuario = async () => {
      const data = await AsyncStorage.getItem("usuario");
      const user = JSON.parse(data);
      setUsuario(user);

      // Obtener enfoqueId del alumno
      const res = await fetch(
        `http://localhost:5000/api/alumno-enfoque/${user.id}`
      );
      const json = await res.json();
      if (json?.enfoqueId) setEnfoqueId(json.enfoqueId._id);
    };
    cargarUsuario();
  }, []);

  const siguiente = async (correcto) => {
    if (correcto) setAciertos(aciertos + 1);
    setMostrarRespuesta(false);
    if (index < todasPreguntas.length - 1) setIndex(index + 1);

    // Cuando termine todas las flashcards predeterminadas
    if (index === todasPreguntas.length - 1 && correcto) {
      await crearActividadFlashcards();
    }
  };

  // Crear actividad en la DB
  const crearActividadFlashcards = async () => {
    if (!usuario || !enfoqueId) return console.log("No hay usuario o enfoque");

    try {
      console.log("Creando actividad Flashcards en DB...");
      const res = await fetch("http://localhost:5000/api/actividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "Flashcards rápidas",
          descripcion: "Actividad predeterminada completada",
          tipo: "flashcard",
          enfoqueId,
        }),
      });
      const data = await res.json();
      console.log("Actividad creada:", data);
    } catch (error) {
      console.log("Error creando actividad:", error);
    }
  };

  const agregarFlashcard = async () => {
    if (!nuevaPregunta.trim() || !nuevaRespuesta.trim()) return;
    const nueva = { pregunta: nuevaPregunta, respuesta: nuevaRespuesta };

    // Guardar en backend como "apunte"
    try {
      const res = await fetch(
        `http://localhost:5000/api/actividades/${actividadId}/flashcards`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flashcards: [nueva] }),
        }
      );
      const data = await res.json();
      console.log("Flashcard agregada en DB:", data);
    } catch (error) {
      console.log("Error guardando flashcard:", error);
    }

    // Guardar localmente para mostrar debajo
    setMisFlashcards([...misFlashcards, nueva]);
    setNuevaPregunta("");
    setNuevaRespuesta("");
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>📘 Flashcards Rápidas</Text>

      {!crearModo && (
        <>
          {/* FLASHCARDS predeterminadas */}
          {todasPreguntas.length > 0 && index < todasPreguntas.length && (
            <View style={s.card}>
              <Text style={s.pregunta}>{todasPreguntas[index].pregunta}</Text>
              {mostrarRespuesta && (
                <Text style={s.respuesta}>
                  {todasPreguntas[index].respuesta}
                </Text>
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
          )}

          {/* BOTONES */}
          {index < todasPreguntas.length && (
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
          )}

          <Text style={s.progreso}>
            Tarjeta {index + 1} / {todasPreguntas.length}
          </Text>
          <Text style={s.aciertos}>Aciertos: {aciertos}</Text>
        </>
      )}

      {/* CREAR FLASHCARD */}
      {crearModo && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            placeholder="Nueva pregunta"
            style={s.input}
            value={nuevaPregunta}
            onChangeText={setNuevaPregunta}
          />
          <TextInput
            placeholder="Nueva respuesta"
            style={s.input}
            value={nuevaRespuesta}
            onChangeText={setNuevaRespuesta}
          />

          <TouchableOpacity
            style={[s.btn, { marginBottom: 10 }]}
            onPress={agregarFlashcard}
          >
            <Text style={s.btnText}>Agregar / Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mis Flashcards creadas */}
      {misFlashcards.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
            Mis Flashcards creadas:
          </Text>
          {misFlashcards.map((f, i) => (
            <View key={i} style={s.boxFlashcard}>
              <Text style={s.boxPregunta}>{f.pregunta}</Text>
              <Text style={s.boxRespuesta}>{f.respuesta}</Text>
            </View>
          ))}
        </View>
      )}

      {/* TOGGLE SECCIÓN */}
      <View style={s.sectionToggle}>
        <TouchableOpacity
          style={s.sectionButton}
          onPress={() => setCrearModo(!crearModo)}
        >
          <Text style={s.btnText}>
            {crearModo ? "Ver Flashcards" : "Crear Flashcard"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
