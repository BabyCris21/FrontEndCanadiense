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
  const [tema, setTema] = useState("light");
  const [enfoqueActual, setEnfoqueActual] = useState(null);
  const [enfoques, setEnfoques] = useState([]);

  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (colorScheme) setTema(colorScheme);

    const cargarDatos = async () => {
      try {
        const data = await AsyncStorage.getItem("usuario");
        const user = JSON.parse(data);
        setUsuario(user);

        // Bienvenida una sola vez
        const yaMostrado = await AsyncStorage.getItem("welcomeShown");
        if (!yaMostrado) {
          setShowWelcome(true);
          await AsyncStorage.setItem("welcomeShown", "true");
        }

        // Cargar enfoque actual desde la API
        const res = await fetch(
          `http://192.168.18.40:5000/api/alumno-enfoque/${user.id}`
        );
        const json = await res.json();
        if (json?.enfoqueId?.nombre) {
          setEnfoqueActual(json.enfoqueId.nombre);
        }

        // Cargar todos los enfoques disponibles
        const resEnfoques = await fetch(
          "http://192.168.18.40:5000/api/enfoques"
        );
        const jsonEnfoques = await resEnfoques.json();
        setEnfoques(jsonEnfoques);
      } catch (err) {
        console.log("Error cargando usuario:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleEnfoqueSelect = async (enfoque) => {
    try {
      console.log("Enviando al backend:", {
        alumnoId: usuario.id,
        enfoqueId: enfoque._id,
      });

      const res = await fetch(
        "http://192.168.18.40:5000/api/alumno-enfoque/set",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alumnoId: usuario.id,
            enfoqueId: enfoque._id,
          }),
        }
      );

      const data = await res.json();
      console.log("Respuesta backend:", data);

      setEnfoqueActual(enfoque.nombre);

      router.push({
        pathname: "/enfoqueDetalle",
        params: { usuario: usuario.id, enfoque: enfoque.nombre },
      });
    } catch (error) {
      console.log("Error guardando enfoque:", error);
    }
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
      {usuario && (
        <WelcomePopup
          visible={showWelcome}
          nombre={usuario.nombre}
          onClose={() => setShowWelcome(false)}
        />
      )}

      <ScrollView>
        <Text style={[styles.title, { color: colors.title }]}>
          Hola, {usuario?.nombre} 👋
        </Text>

        {/* --- Enfoque actual --- */}
        {enfoqueActual && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>
              🎯 Tu enfoque actual
            </Text>
            <Text style={[styles.cardText, { color: colors.cardText }]}>
              {enfoqueActual}
            </Text>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.button, marginTop: 10 },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/enfoqueAcademico",
                  params: { usuario: usuario.id, enfoque: enfoqueActual },
                })
              }
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Ver actividades →
              </Text>

              <View style={{ alignItems: "flex-end", marginTop: 20 }}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor: "#E53935",
                      width: 150,
                      marginBottom: 30,
                    },
                  ]}
                  onPress={async () => {
                    await AsyncStorage.clear(); // borra todos los datos guardados
                    router.push("/index"); // reemplaza "/login" por tu ruta de login
                  }}
                >
                  <Text style={[styles.buttonText, { color: "#fff" }]}>
                    Cerrar sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* --- Selección de enfoque --- */}
        {!enfoqueActual && (
          <>
            <Text
              style={[
                styles.subtitle,
                { color: colors.subtitle, marginTop: 30 },
              ]}
            >
              Selecciona tu enfoque actual:
            </Text>

            {enfoques.map((obj) => (
              <TouchableOpacity
                key={obj._id}
                style={[styles.button, { backgroundColor: colors.button }]}
                onPress={() => handleEnfoqueSelect(obj)}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  {obj.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
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
