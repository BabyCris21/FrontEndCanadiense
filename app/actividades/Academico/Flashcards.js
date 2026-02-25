import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://appcanadiense.onrender.com";

const COLORS = {
  primaryBlue: "#1E56A0",
  lightBlue: "#E1F0FF",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  accentBlue: "#3B82F6",
  correcto: "#10B981",
  incorrecto: "#EF4444",
  bgGray: "#F8FAFF",
};

export default function FlashcardsYQuiz() {
  const router = useRouter();

  // --- BANCO DE 5 PREGUNTAS ---
  const preguntasQuiz = [
    {
      id: 1,
      pregunta: "¿Qué es una variable en programación?",
      opciones: [
        "Un tipo de virus",
        "Un espacio de memoria",
        "Una constante física",
      ],
      correcta: 1,
    },
    {
      id: 2,
      pregunta: "¿Cuál es la unidad básica de la vida?",
      opciones: ["El átomo", "La célula", "El tejido"],
      correcta: 1,
    },
    {
      id: 3,
      pregunta: "¿Cuál es el planeta más cercano al Sol?",
      opciones: ["Venus", "Marte", "Mercurio"],
      correcta: 2,
    },
    {
      id: 4,
      pregunta: "¿Qué gas es esencial para la respiración?",
      opciones: ["Oxígeno", "Nitrógeno", "Argón"],
      correcta: 0,
    },
    {
      id: 5,
      pregunta: "¿Cuál es el resultado de 15 x 3?",
      opciones: ["35", "45", "55"],
      correcta: 1,
    },
  ];

  const [index, setIndex] = useState(0);
  const [puntaje, setPuntaje] = useState({ correctas: 0, incorrectas: 0 });
  const [quizCompletado, setQuizCompletado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  const [misFlashcards, setMisFlashcards] = useState([]);
  const [actividadId, setActividadId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [flashcardEditando, setFlashcardEditando] = useState(null);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const userData = await AsyncStorage.getItem("usuario");
      if (!userData) return;
      const user = JSON.parse(userData);
      setUsuario(user);

      const rEnfoque = await fetch(`${BASE_URL}/api/alumno-enfoque/${user.id}`);
      if (rEnfoque.ok) {
        const jEnfoque = await rEnfoque.json();
        const rAct = await fetch(
          `${BASE_URL}/api/actividades/flashcard/${jEnfoque.enfoqueId._id}?usuarioId=${user.id}`,
        );
        if (rAct.ok) {
          const actData = await rAct.json();
          setActividadId(actData._id);
          setMisFlashcards(actData.flashcards || []);
        }
      }
    } catch (e) {
      console.log("Error inicializando:", e);
    } finally {
      setCargando(false);
    }
  };

  const manejarRespuestaQuiz = async (opcIdx) => {
    const esCorrecta = opcIdx === preguntasQuiz[index].correcta;
    const nuevoPuntaje = {
      correctas: esCorrecta ? puntaje.correctas + 1 : puntaje.correctas,
      incorrectas: !esCorrecta ? puntaje.incorrectas + 1 : puntaje.incorrectas,
    };

    if (index < preguntasQuiz.length - 1) {
      setPuntaje(nuevoPuntaje);
      setIndex(index + 1);
    } else {
      setPuntaje(nuevoPuntaje);
      setQuizCompletado(true);
      enviarReporte(nuevoPuntaje);
    }
  };

  const enviarReporte = async (p) => {
    try {
      await fetch(`${BASE_URL}/api/reportes/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          actividadTipo: "flashcards",
          correctas: p.correctas,
          incorrectas: p.incorrectas,
          total: preguntasQuiz.length,
        }),
      });
    } catch (e) {
      console.log("Error reporte");
    }
  };

  const guardarFlashcard = async () => {
    if (!nuevaPregunta || !nuevaRespuesta) return;
    try {
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
          },
        );
        setMisFlashcards(
          misFlashcards.map((f) =>
            f._id === flashcardEditando._id
              ? { ...f, pregunta: nuevaPregunta, respuesta: nuevaRespuesta }
              : f,
          ),
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
          },
        );
        const data = await res.json();
        setMisFlashcards(data.flashcards);
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  const eliminarFlashcard = (id) => {
    Alert.alert("Eliminar", "¿Borrar esta tarjeta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(
              `${BASE_URL}/api/actividades/${actividadId}/flashcards/${id}`,
              { method: "DELETE" },
            );
            setMisFlashcards(misFlashcards.filter((f) => f._id !== id));
          } catch (e) {
            Alert.alert("Error", "No se pudo borrar");
          }
        },
      },
    ]);
  };

  const abrirModal = (f = null) => {
    setFlashcardEditando(f);
    setNuevaPregunta(f ? f.pregunta : "");
    setNuevaRespuesta(f ? f.respuesta : "");
    setModalVisible(true);
  };

  if (cargando)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER IDÉNTICO A ALUMNOSCREEN */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flashcards & Quiz</Text>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="brain"
              size={22}
              color={COLORS.primaryBlue}
            />
          </View>
        </View>
        <View style={styles.whiteCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.line} />
          <Text style={styles.sectionTitle}>RETO DE EVALUACIÓN</Text>
          <View style={styles.line} />
        </View>

        {!quizCompletado ? (
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Pregunta {index + 1} de {preguntasQuiz.length}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((index + 1) / preguntasQuiz.length) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.preguntaQuizText}>
              {preguntasQuiz[index].pregunta}
            </Text>
            {preguntasQuiz[index].opciones.map((opc, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionBtn}
                onPress={() => manejarRespuestaQuiz(idx)}
              >
                <View style={styles.optionCircle}>
                  <Text style={styles.optionLetter}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.card,
              {
                alignItems: "center",
                borderColor: COLORS.correcto,
                borderWidth: 1.5,
              },
            ]}
          >
            <Ionicons name="ribbon" size={50} color={COLORS.correcto} />
            <Text style={styles.resultTitle}>¡Quiz Finalizado!</Text>
            <Text style={styles.resultPuntaje}>
              Lograste {puntaje.correctas} de {preguntasQuiz.length} correctas
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setIndex(0);
                setQuizCompletado(false);
                setPuntaje({ correctas: 0, incorrectas: 0 });
              }}
            >
              <Text style={styles.retryText}>Reiniciar Quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.line} />
          <Text style={styles.sectionTitle}>MIS NOTAS PERSONALES</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.mainAddBtn}
          onPress={() => abrirModal()}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.mainAddBtnText}>Nueva Flashcard</Text>
        </TouchableOpacity>

        {misFlashcards.map((f) => (
          <View key={f._id} style={styles.miniCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.miniPregunta}>{f.pregunta}</Text>
              <TouchableOpacity
                onPress={() => Alert.alert("Respuesta", f.respuesta)}
              >
                <Text style={styles.verMas}>Ver respuesta</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.miniActions}>
              <TouchableOpacity
                onPress={() => abrirModal(f)}
                style={styles.actionIcon}
              >
                <Ionicons name="pencil" size={18} color={COLORS.textGray} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => eliminarFlashcard(f._id)}
                style={styles.actionIcon}
              >
                <Ionicons name="trash" size={18} color={COLORS.incorrecto} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* TAB BAR IDÉNTICO A ALUMNOSCREEN */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/AlumnoScreen")}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabLabel}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/actividades/Academico/EnfoqueAcademico")}
        >
          <Ionicons name="document-text" size={24} color={COLORS.primaryBlue} />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>
            Ejercicios
          </Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons
            name="bar-chart-outline"
            size={24}
            color={COLORS.textGray}
          />
          <Text style={styles.tabLabel}>Progreso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>
              {flashcardEditando ? "Editar Nota" : "Nueva Nota"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Pregunta"
              value={nuevaPregunta}
              onChangeText={setNuevaPregunta}
            />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Respuesta"
              multiline
              value={nuevaRespuesta}
              onChangeText={setNuevaRespuesta}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontWeight: "700", color: COLORS.textGray }}>
                  Cerrar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnSave}
                onPress={guardarFlashcard}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: COLORS.primaryBlue,
    height: Platform.OS === "ios" ? 145 : 125,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 35,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { padding: 5 },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    marginLeft: 10,
  },
  iconBox: { backgroundColor: "white", padding: 7, borderRadius: 10 },
  whiteCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  scrollContainer: { paddingHorizontal: 20, paddingBottom: 110 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: "#F1F5F9" },
  sectionTitle: {
    marginHorizontal: 15,
    color: COLORS.textGray,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  progressHeader: { marginBottom: 15 },
  progressText: {
    fontSize: 12,
    color: COLORS.primaryBlue,
    fontWeight: "800",
    marginBottom: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: COLORS.accentBlue },
  preguntaQuizText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 20,
  },

  optionBtn: {
    backgroundColor: COLORS.bgGray,
    padding: 14,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLetter: { color: "white", fontWeight: "bold", fontSize: 12 },
  optionText: {
    color: COLORS.textDark,
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginTop: 10,
  },
  resultPuntaje: {
    color: COLORS.textGray,
    fontSize: 14,
    marginTop: 5,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 15,
    backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: "white", fontWeight: "bold" },

  mainAddBtn: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginBottom: 20,
  },
  mainAddBtnText: { color: "white", fontWeight: "bold", fontSize: 15 },

  miniCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  miniPregunta: {
    fontWeight: "700",
    color: COLORS.textDark,
    fontSize: 15,
    marginBottom: 4,
  },
  verMas: { color: COLORS.accentBlue, fontSize: 12, fontWeight: "700" },
  miniActions: { flexDirection: "row", gap: 8 },
  actionIcon: { padding: 8, backgroundColor: COLORS.bgGray, borderRadius: 10 },

  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 95 : 80,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 15,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabLabel: { fontSize: 12, color: COLORS.textGray, marginTop: 4 },
  tabLabelActive: { color: COLORS.primaryBlue, fontWeight: "700" },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primaryBlue,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBody: { backgroundColor: "white", borderRadius: 25, padding: 25 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: COLORS.bgGray,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  modalRow: { flexDirection: "row", gap: 12 },
  btnCancel: { flex: 1, alignItems: "center", padding: 15 },
  btnSave: {
    flex: 1,
    backgroundColor: COLORS.primaryBlue,
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
  },
});
