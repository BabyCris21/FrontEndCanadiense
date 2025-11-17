import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import WelcomePopup from "../components/ui/WelcomePopup";

export default function AlumnoScreen() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tema, setTema] = useState("light"); // default
  const router = useRouter();

  // Detectar tema del dispositivo
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (colorScheme) setTema(colorScheme);

    const cargarDatos = async () => {
      try {
        const data = await AsyncStorage.getItem("usuario");
        const user = JSON.parse(data);
        setUsuario(user);

        // Verificar si ya se mostró la bienvenida
        const yaMostrado = await AsyncStorage.getItem("welcomeShown");
        if (!yaMostrado) {
          setShowWelcome(true);
          await AsyncStorage.setItem("welcomeShown", "true");
        }
      } catch (err) {
        console.log("Error cargando usuario:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const enfoques = [
    "Mejorar organización",
    "Aumentar constancia",
    "Incrementar motivación",
    "Optimizar rendimiento académico",
  ];

  const handleEnfoqueSelect = (enfoque) => {
    router.push({
      pathname: "/enfoqueDetalle",
      params: { usuario, enfoque },
    });
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A5AE0" />
        <Text style={{ marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

  const colors = tema === "dark" ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* --- POPUP DE BIENVENIDA --- */}
      {usuario && (
        <WelcomePopup
          visible={showWelcome}
          nombre={usuario.nombre}
          onClose={() => setShowWelcome(false)}
        />
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <ScrollView>
        <Text style={[styles.title, { color: colors.title }]}>
          Hola, {usuario?.nombre} 👋
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>
          Aquí verás tu progreso, metas y recomendaciones.
        </Text>

        {/* Cards */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>
            📘 Tu grado
          </Text>
          <Text style={[styles.cardText, { color: colors.cardText }]}>
            {usuario?.grado || "No asignado"}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>
            🎯 Tus objetivos
          </Text>
          <Text style={[styles.cardText, { color: colors.cardText }]}>
            Pronto verás metas sugeridas aquí.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>
            📅 Próximas tareas
          </Text>
          <Text style={[styles.cardText, { color: colors.cardText }]}>
            Aún no tienes tareas asignadas.
          </Text>
        </View>

        {/* --- SELECCIÓN DE ENFOQUE --- */}
        <Text
          style={[styles.subtitle, { color: colors.subtitle, marginTop: 30 }]}
        >
          Selecciona tu enfoque actual:
        </Text>
        {enfoques.map((obj, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.button, { backgroundColor: colors.button }]}
            onPress={() => handleEnfoqueSelect(obj)}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>
              {obj}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 15 },
  card: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  cardText: { fontSize: 15 },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
