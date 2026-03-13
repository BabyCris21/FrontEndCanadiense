import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1E56A0",
  lightBlue: "#E1F0FF",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  academico: "#3B82F6",
};

export default function Autoevaluacion() {
  const router = useRouter();

  const preguntas = [
    "Me concentré durante las clases",
    "Evité distracciones con el celular",
    "Comprendí los temas vistos hoy",
    "Participé activamente en clase",
    "Tomé apuntes de lo importante",
    "Revisé mis apuntes después de clase",
    "Estudié al menos un tema adicional",
    "Organicé bien mi tiempo de estudio",
    "Cumplí con mis tareas del día",
    "Me siento motivado para aprender",
  ];

  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const responder = (i, v) => {
    const copia = { ...respuestas };
    copia[i] = v;
    setRespuestas(copia);
  };

  const evaluar = () => {
    const valores = Object.values(respuestas);

    if (valores.length !== preguntas.length) {
      alert("Responde todas las preguntas");
      return;
    }

    const total = valores.reduce((a, b) => a + b, 0);

    let mensaje = "";
    let emoji = "";
    let recomendacion = "";

    if (total >= 36) {
      mensaje = "Vas bien";
      emoji = "😊";
      recomendacion =
        "Sigue manteniendo tus buenos hábitos de estudio y organización.";
    } else if (total >= 20) {
      mensaje = "Lo puedes hacer mejor";
      emoji = "😐";
      recomendacion =
        "Intenta reducir distracciones y organizar mejor tu tiempo de estudio.";
    } else {
      mensaje = "Tenemos que mejorar";
      emoji = "😟";
      recomendacion =
        "Te recomendamos crear un horario de estudio y evitar distracciones.";
    }

    setResultado({
      total,
      mensaje,
      emoji,
      recomendacion,
    });

    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Autoevaluación de Enfoque Académico
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.descripcion}>
          Responde las siguientes preguntas calificando tu desempeño del día.
        </Text>

        <View style={styles.leyendaBox}>
          <Text style={styles.leyendaTitle}>Escala de evaluación</Text>

          <Text style={styles.leyendaText}>1 = Muy bajo esfuerzo</Text>

          <Text style={styles.leyendaText}>3 = Esfuerzo promedio</Text>

          <Text style={styles.leyendaText}>5 = Excelente desempeño</Text>
        </View>

        {preguntas.map((p, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.pregunta}>{p}</Text>

            <View style={styles.fila}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.boton,
                    respuestas[i] === n && styles.botonActivo,
                  ]}
                  onPress={() => responder(i, n)}
                >
                  <Text style={styles.num}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.evaluarBtn} onPress={evaluar}>
          <Ionicons name="analytics" size={18} color="white" />

          <Text style={styles.evaluarText}>Evaluar enfoque</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* POPUP RESULTADO */}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.emoji}>{resultado?.emoji}</Text>

            <Text style={styles.resultTitle}>{resultado?.mensaje}</Text>

            <Text style={styles.resultScore}>
              Puntaje: {resultado?.total} / 50
            </Text>

            <Text style={styles.recomendacion}>{resultado?.recomendacion}</Text>

            <TouchableOpacity
              style={styles.cerrarBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  header: {
    backgroundColor: "#1E56A0",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  descripcion: {
    color: "#2D4B7A",
    marginBottom: 15,
  },

  leyendaBox: {
    backgroundColor: "#E1F0FF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },

  leyendaTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1E56A0",
  },

  leyendaText: {
    fontSize: 13,
    color: "#2D4B7A",
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },

  pregunta: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2D4B7A",
  },

  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  boton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  botonActivo: {
    backgroundColor: "#E1F0FF",
  },

  num: {
    fontWeight: "bold",
  },

  evaluarBtn: {
    backgroundColor: "#3B82F6",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },

  evaluarText: {
    color: "white",
    fontWeight: "bold",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },

  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E56A0",
  },

  resultScore: {
    marginTop: 5,
  },

  recomendacion: {
    marginTop: 10,
    textAlign: "center",
    color: "#4A5568",
  },

  cerrarBtn: {
    backgroundColor: "#1E56A0",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
});
