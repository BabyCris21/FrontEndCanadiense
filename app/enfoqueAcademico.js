import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function EnfoqueAcademico() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
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

        {/* 6. Mapa Mental Interactivo */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/actividades/Academico/MapaMental")}
        >
          <Text style={styles.cardTitle}>🧩 Mapa Mental Interactivo</Text>
          <Text style={styles.cardDesc}>
            Organiza ideas arrastrando conceptos para crear tu propio mapa
            mental.
          </Text>
        </TouchableOpacity>

        {/* --- Módulos aún no listos (comentados) --- */}
        {/*
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/enfoqueAcademico/atencionErrores")}
        >
          <Text style={styles.cardTitle}>
            👀 Reto de Atención: Encuentra Errores
          </Text>
          <Text style={styles.cardDesc}>
            Identifica palabras o frases incorrectas para mejorar tu concentración.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/enfoqueAcademico/planificador")}
        >
          <Text style={styles.cardTitle}>📅 Planificador con Seguimiento</Text>
          <Text style={styles.cardDesc}>
            Crea un plan de estudio diario y registra tu progreso real.
          </Text>
        </TouchableOpacity>
        */}
      </ScrollView>

      {/* Botón de Cerrar sesión en círculo */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("usuario");
            router.replace("/"); // pantalla principal login
          } catch (error) {
            console.log("Error al cerrar sesión:", error);
          }
        }}
      >
        <Ionicons name="log-out-outline" size={24} color="#EFECE3" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E0DACC" }, // fondo uniforme
  container: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4A70A9",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDesc: { fontSize: 14, marginTop: 6 },
  logoutButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#4A70A9",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
});
