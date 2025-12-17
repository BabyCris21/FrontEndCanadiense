import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function EnfoqueAcademico() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enfoque Académico</Text>

      {/* 1. Minijuego Flashcards */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/actividades/Academico/Flashcards")}
      >
        <Text style={styles.cardTitle}>🧠 Flashcards Rápidas</Text>
        <Text style={styles.cardDesc}>
          Memoriza conceptos claves usando tarjetas interactivas.
        </Text>
      </TouchableOpacity>

      {/* 3. Reto de Atención */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/enfoqueAcademico/atencionErrores")}
      >
        <Text style={styles.cardTitle}>
          👀 Reto de Atención: Encuentra Errores
        </Text>
        <Text style={styles.cardDesc}>
          Identifica palabras o frases incorrectas para mejorar tu
          concentración.
        </Text>
      </TouchableOpacity>

      {/* 6. Mapa Mental Interactivo */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/actividades/Academico/MapaMental")}
      >
        <Text style={styles.cardTitle}>🧩 Mapa Mental Interactivo</Text>
        <Text style={styles.cardDesc}>
          Organiza ideas arrastrando conceptos para crear tu propio mapa mental.
        </Text>
      </TouchableOpacity>

      {/* 7. Planificador con seguimiento */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/enfoqueAcademico/planificador")}
      >
        <Text style={styles.cardTitle}>📅 Planificador con Seguimiento</Text>
        <Text style={styles.cardDesc}>
          Crea un plan de estudio diario y registra tu progreso real.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f7f7f7" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6A5AE0",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDesc: { fontSize: 14, marginTop: 6 },
});
