import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BarChart, LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const BASE_URL = "https://appcanadiense.onrender.com";

const COLORS = {
  primaryBlue: "#1E56A0",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export default function AutoevaluacionScreen() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [historial, setHistorial] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);

  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mensajePopup, setMensajePopup] = useState("");
  const [emojiPopup, setEmojiPopup] = useState("");
  const [puntajePopup, setPuntajePopup] = useState(0);

  const preguntas = [
    "¿Qué tan bien organizaste tu tiempo de estudio esta semana?",
    "¿Qué tan concentrado estuviste al estudiar?",
    "¿Cumpliste con las tareas que tenías programadas?",
    "¿Repasaste los temas aprendidos durante la semana?",
    "¿Evitaste distracciones mientras estudiabas?",
    "¿Participaste activamente en clases?",
    "¿Utilizaste técnicas de estudio efectivas?",
    "¿Lograste comprender los temas estudiados?",
    "¿Buscaste ayuda cuando no entendías algún tema?",
    "¿Te sientes satisfecho con tu desempeño académico?",
  ];

  const [respuestas, setRespuestas] = useState(Array(10).fill(0));

  useEffect(() => {
    const cargarUsuario = async () => {
      const data = await AsyncStorage.getItem("usuario");

      if (data) {
        const user = JSON.parse(data);
        setUsuario(user);
        obtenerHistorial(user.id);
      }
    };

    cargarUsuario();
  }, []);

  const obtenerHistorial = async (userId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/actividades/autoevaluacion/${userId}`,
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setHistorial(data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const seleccionar = (i, v) => {
    const nuevas = [...respuestas];
    nuevas[i] = v;
    setRespuestas(nuevas);
  };

  const finalizarEvaluacion = async () => {
    if (respuestas.includes(0)) {
      Alert.alert("Incompleto", "Responde todas las preguntas.");
      return;
    }

    const puntajeTotal = respuestas.reduce((a, b) => a + b, 0);

    let texto = "";
    let emoji = "";

    if (puntajeTotal >= 36) {
      texto = "Felicitaciones, vas por buen camino";
      emoji = "😄";
    } else if (puntajeTotal >= 21) {
      texto = "Buen desempeño, sigue así";
      emoji = "🙂";
    } else {
      texto = "Debes mejorar tus hábitos de estudio";
      emoji = "😔";
    }

    setPuntajePopup(puntajeTotal);
    setMensajePopup(texto);
    setEmojiPopup(emoji);

    try {
      const rEnfoque = await fetch(
        `${BASE_URL}/api/alumno-enfoque/${usuario.id}`,
      );
      const dataEnfoque = await rEnfoque.json();

      const enfoqueIdLimpio =
        dataEnfoque.enfoqueId?._id || dataEnfoque.enfoqueId;

      const payload = {
        usuarioId: usuario.id,
        enfoqueId: enfoqueIdLimpio,
        tipo: "autoevaluacion",
        titulo: "Autoevaluación Semanal",
        descripcion: "Registro de progreso académico",

        autoevaluacion: {
          puntaje: puntajeTotal,
          resultado: `${texto} ${emoji}`,
        },

        completada: true,
      };

      await fetch(`${BASE_URL}/api/actividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setMostrarPopup(true);
      setMostrarFormulario(false);
      setRespuestas(Array(10).fill(0));

      obtenerHistorial(usuario.id);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  /* ======================
     DATOS PARA LOS GRAFICOS
  ====================== */

  const progresoSemanal = {
    labels: historial.map((_, i) => `S${i + 1}`),

    datasets: [
      {
        data: historial.map((q) => q.autoevaluacion?.puntaje || 0),
      },
    ],
  };

  let alto = 0;
  let medio = 0;
  let bajo = 0;

  historial.forEach((q) => {
    const p = q.autoevaluacion?.puntaje || 0;

    if (p >= 36) alto++;
    else if (p >= 21) medio++;
    else bajo++;
  });

  const rendimientoGeneral = {
    labels: ["Alto", "Medio", "Bajo"],

    datasets: [
      {
        data: [alto, medio, bajo],
      },
    ],
  };

  const tendenciaAprendizaje = {
    labels: historial.map((_, i) => `${i + 1}`),

    datasets: [
      {
        data: historial.map((q) => q.autoevaluacion?.puntaje || 0),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",

    decimalPlaces: 0,

    color: (opacity = 1) => `rgba(30,86,160,${opacity})`,

    labelColor: () => "#334155",

    barPercentage: 0.6, // separación entre barras
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryBlue}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Autoevaluación Semanal</Text>
      </View>

      {/* LISTA */}

      {!mostrarFormulario && !mostrarReporte && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>
            Lista de cuestionarios realizados
          </Text>

          {historial.map((item, index) => (
            <View key={index} style={styles.historialCard}>
              <Text style={styles.cardTitle}>Cuestionario {index + 1}</Text>

              <Text style={styles.cardScore}>
                Puntaje: {item.autoevaluacion?.puntaje}
              </Text>

              <Text style={styles.cardResult}>
                {item.autoevaluacion?.resultado}
              </Text>
            </View>
          ))}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.btnLeft}
              onPress={() => setMostrarFormulario(true)}
            >
              <Text style={styles.btnActionText}>Nuevo cuestionario</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnRight}
              onPress={() => setMostrarReporte(true)}
            >
              <Text style={styles.btnActionText}>Reporte / Avance</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* DASHBOARD */}

      {mostrarReporte && (
        <ScrollView
          style={{ padding: 20 }}
          contentContainerStyle={{ paddingBottom: 90 }}
        >
          <Text style={styles.chartTitle}>Progreso semanal</Text>

          <Text style={styles.axisLabel}>Puntaje</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={progresoSemanal}
              width={Math.max(screenWidth, historial.length * 70)}
              height={220}
              yAxisSuffix=""
              fromZero
              chartConfig={chartConfig}
              style={{
                marginVertical: 15,
                borderRadius: 16,
              }}
            />
          </ScrollView>

          <Text style={styles.axisX}>Cuestionarios realizados</Text>

          <Text style={styles.chartTitle}>Rendimiento general</Text>

          <Text style={styles.axisLabel}>Cantidad</Text>

          <BarChart
            data={rendimientoGeneral}
            width={screenWidth - 40}
            height={220}
            fromZero
            chartConfig={chartConfig}
            style={{
              marginVertical: 20,
            }}
          />

          <Text style={styles.axisX}>Nivel de rendimiento</Text>

          <Text style={styles.chartTitle}>Tendencia de aprendizaje</Text>

          <Text style={styles.axisLabel}>Puntaje</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={tendenciaAprendizaje}
              width={Math.max(screenWidth, historial.length * 70)}
              height={220}
              chartConfig={chartConfig}
              fromZero
              bezier
              style={{
                marginVertical: 15,
                borderRadius: 16,
              }}
            />
          </ScrollView>

          <Text style={styles.axisX}>Número de cuestionario</Text>

          <TouchableOpacity
            style={styles.closeReport}
            onPress={() => setMostrarReporte(false)}
          >
            <Text style={{ color: "white" }}>Cerrar reporte</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {preguntas.map((p, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.question}>
                {i + 1}. {p}
              </Text>

              <View style={styles.row}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => seleccionar(i, v)}
                    style={[
                      styles.numBtn,
                      respuestas[i] === v && styles.numBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.numText,
                        respuestas[i] === v && styles.textWhite,
                      ]}
                    >
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.mainBtn}
            onPress={finalizarEvaluacion}
          >
            <Text style={styles.mainBtnText}>Finalizar Autoevaluación</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* POPUP */}
      <Modal visible={mostrarPopup} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 60 }}>{emojiPopup}</Text>

            <Text>Puntaje: {puntajePopup}/50</Text>

            <Text>{mensajePopup}</Text>

            <TouchableOpacity
              style={styles.closeReport}
              onPress={() => setMostrarPopup(false)}
            >
              <Text style={{ color: "white" }}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================== ESTILOS ================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2F7" },

  header: {
    backgroundColor: "#1E56A0",
    height: 110,
    paddingTop: 45,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },

  scrollContent: { padding: 20 },

  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },

  historialCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 18,
    marginTop: 15,
  },

  cardTitle: { fontWeight: "700" },

  cardScore: { marginTop: 5 },

  cardResult: { color: "#64748B" },

  actionsRow: { flexDirection: "row", marginTop: 25 },

  btnLeft: {
    flex: 1,
    backgroundColor: "#10B981",
    padding: 18,
    borderRadius: 14,
    marginRight: 8,
    alignItems: "center",
  },

  btnRight: {
    flex: 1,
    backgroundColor: "#1E56A0",
    padding: 18,
    borderRadius: 14,
    marginLeft: 8,
    alignItems: "center",
  },

  btnActionText: {
    color: "white",
    fontWeight: "700",
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },

  closeReport: {
    backgroundColor: "#1E56A0",
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  question: { fontSize: 16, fontWeight: "600", marginBottom: 15 },

  row: { flexDirection: "row", justifyContent: "space-between" },

  numBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },

  numBtnActive: {
    backgroundColor: "#1E56A0",
    borderColor: "#1E56A0",
  },

  numText: { fontWeight: "700" },

  textWhite: { color: "white" },

  mainBtn: {
    backgroundColor: "#10B981",
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  mainBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "white",
    padding: 35,
    borderRadius: 22,
    width: "80%",
    alignItems: "center",
  },
  axisLabel: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 10,
    marginLeft: 5,
  },

  axisX: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
});
