import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ======================= CONFIG ======================= */
const BASE_URL = "http://192.168.18.40:5000";

/* ======================= COLORES ======================= */
const lightColors = {
  background: "#EFECE3",
  title: "#4A70A9",
  subtitle: "#4A70A9",
  card: "#FFFFFF",
  cardTitle: "#4A70A9",
  cardText: "#000000",
  button: "#8FABD4",
  buttonText: "#000000",
  correcto: "#4CAF50",
  incorrecto: "#E53935",
  editBorder: "#4A70A9",
  placeholder: "#888",
};

/* ======================= ESTILOS ======================= */
const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { padding: 20, paddingBottom: 80 },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.title,
      textAlign: "center",
    },
    card: {
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 15,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    cardEdit: { borderWidth: 2, borderColor: theme.editBorder },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    pregunta: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.cardText,
      flex: 1,
    },
    respuesta: { fontSize: 16, marginBottom: 10, color: theme.subtitle },
    btnVer: {
      backgroundColor: theme.button,
      padding: 10,
      borderRadius: 8,
      marginTop: 5,
    },
    btnText: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "bold",
      color: theme.buttonText,
    },
    iconBtn: { marginLeft: 10 },
    icon: { fontSize: 20 },
    input: {
      backgroundColor: "#eee",
      padding: 10,
      borderRadius: 8,
      marginBottom: 5,
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
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: theme.card,
      padding: 20,
      borderRadius: 15,
      width: "90%",
    },
  });

export default function Flashcards() {
  const theme = lightColors;
  const s = styles(theme);

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
  const [misFlashcards, setMisFlashcards] = useState([]);
  const [flashcardEditando, setFlashcardEditando] = useState(null);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [enfoqueId, setEnfoqueId] = useState(null);
  const [actividadId, setActividadId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("usuario"));
        setUsuario(user);

        const r1 = await fetch(`${BASE_URL}/api/alumno-enfoque/${user.id}`);
        const j1 = await r1.json();
        setEnfoqueId(j1.enfoqueId._id);

        let r2 = await fetch(
          `${BASE_URL}/api/actividades/flashcard/${j1.enfoqueId._id}?usuarioId=${user.id}`
        );
        let act = await r2.json();

        // Si no existe la actividad, crearla automáticamente
        if (!act) {
          const crearRes = await fetch(`${BASE_URL}/api/actividades`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuarioId: user.id,
              enfoqueId: j1.enfoqueId._id,
              tipo: "flashcard",
              titulo: "Mis Flashcards",
              descripcion: "Actividad inicial de flashcards",
            }),
          });
          const data = await crearRes.json();
          act = data.actividad;
        }

        setActividadId(act._id);
        setMisFlashcards(act.flashcards || []);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar las flashcards.");
        console.log(error);
      }
    };
    init();
  }, []);

  const siguiente = (correcto) => {
    if (correcto) setAciertos((a) => a + 1);
    setMostrarRespuesta(false);
    if (index < defaultPreguntas.length - 1) setIndex(index + 1);
  };

  const abrirModal = (flashcard = null) => {
    if (flashcard) {
      setFlashcardEditando(flashcard);
      setNuevaPregunta(flashcard.pregunta);
      setNuevaRespuesta(flashcard.respuesta);
    } else {
      setFlashcardEditando(null);
      setNuevaPregunta("");
      setNuevaRespuesta("");
    }
    setModalVisible(true);
  };

  const guardarFlashcard = async () => {
    if (!nuevaPregunta || !nuevaRespuesta) return;

    try {
      if (!actividadId) {
        Alert.alert("Error", "Actividad no encontrada.");
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

      setFlashcardEditando(null);
      setNuevaPregunta("");
      setNuevaRespuesta("");
      setModalVisible(false);
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
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // ajustado para notch / biseles
    >
      <ScrollView
        style={s.container}
        contentContainerStyle={{
          ...s.scrollContent,
          paddingTop: 60,
          paddingBottom: 80,
        }} // padding top y bottom
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <TouchableOpacity
            style={[
              s.btnVer,
              { backgroundColor: theme.correcto, flex: 1, marginRight: 5 },
            ]}
            onPress={() => siguiente(true)}
          >
            <Text style={s.btnText}>✔ Lo sabía</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              s.btnVer,
              { backgroundColor: theme.incorrecto, flex: 1, marginLeft: 5 },
            ]}
            onPress={() => siguiente(false)}
          >
            <Text style={s.btnText}>✖ No lo sabía</Text>
          </TouchableOpacity>
        </View>

        {/* FLASHCARDS CREADAS */}
        {misFlashcards.length > 0 && (
          <>
            <Text style={[s.title, { fontSize: 22, marginTop: 30 }]}>
              📚 Mis Flashcards
            </Text>
            {misFlashcards.map((f) => (
              <View key={f._id} style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.pregunta}>{f.pregunta}</Text>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => abrirModal(f)}>
                      <Text style={s.icon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => eliminarFlashcard(f._id)}
                      style={{ marginLeft: 10 }}
                    >
                      <Text style={s.icon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  style={s.btnVer}
                  onPress={() => Alert.alert("Respuesta", f.respuesta)}
                >
                  <Text style={s.btnText}>Mostrar respuesta</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={s.sectionButton} onPress={() => abrirModal()}>
          <Text style={s.btnText}>Crear Flashcard</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL CREAR / EDITAR FLASHCARD */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={s.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.modalContent}>
            <TextInput
              style={s.input}
              placeholder="Pregunta"
              placeholderTextColor={theme.placeholder}
              value={nuevaPregunta}
              onChangeText={setNuevaPregunta}
            />
            <TextInput
              style={s.input}
              placeholder="Respuesta"
              placeholderTextColor={theme.placeholder}
              value={nuevaRespuesta}
              onChangeText={setNuevaRespuesta}
            />
            <TouchableOpacity style={s.btnVer} onPress={guardarFlashcard}>
              <Text style={s.btnText}>
                {flashcardEditando ? "Actualizar" : "Guardar"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnVer, { backgroundColor: "#aaa", marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={s.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}
