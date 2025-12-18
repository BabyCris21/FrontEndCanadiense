import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import WelcomePopup from "../components/ui/WelcomePopup";

export default function AlumnoScreen() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [enfoqueActual, setEnfoqueActual] = useState(null);
  const [enfoques, setEnfoques] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await AsyncStorage.getItem("usuario");
        const user = JSON.parse(data);
        setUsuario(user);

        const yaMostrado = await AsyncStorage.getItem("welcomeShown");
        if (!yaMostrado) {
          setShowWelcome(true);
          await AsyncStorage.setItem("welcomeShown", "true");
        }

        // Cargar enfoque actual del usuario
        const resEnfoque = await fetch(
          `http://192.168.18.40:5000/api/alumno-enfoque/${user.id}`
        );
        const jsonEnfoque = await resEnfoque.json();
        if (jsonEnfoque?.enfoqueId?.nombre) {
          setEnfoqueActual(jsonEnfoque.enfoqueId.nombre);
        }

        // Cargar todos los enfoques
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
    if (enfoque.nombre !== "Enfoque Académico") return;

    try {
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

      await res.json();
      setEnfoqueActual(enfoque.nombre);

      router.push({
        pathname: "/enfoqueAcademico",
        params: { usuario: usuario.id, enfoque: enfoque.nombre },
      });
    } catch (error) {
      console.log("Error guardando enfoque:", error);
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A70A9" />
        <Text style={{ marginTop: 10, color: "#000" }}>Cargando datos...</Text>
      </View>
    );
  }

  const colors = lightColors;

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

        {/* Si ya hay enfoque, mostrar banner superior */}
        {enfoqueActual && (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>¡Listo para comenzar!</Text>
            <Text style={styles.bannerSubtitle}>
              Aquí está tu enfoque principal. Explora tus actividades y mejora
              tu aprendizaje.
            </Text>
          </View>
        )}

        {/* Mostrar solo la tarjeta del enfoque actual */}
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
            </TouchableOpacity>
          </View>
        )}

        {/* Si no hay enfoque, mostrar lista de enfoques (solo Académico habilitado) */}
        {!enfoqueActual && (
          <>
            <Text
              style={[
                styles.subtitle,
                { color: colors.subtitle, marginTop: 20 },
              ]}
            >
              Selecciona tu enfoque actual:
            </Text>

            {enfoques.map((obj) => {
              const nombre = obj.nombre;
              const bloqueado = nombre !== "Enfoque Académico";

              return (
                <TouchableOpacity
                  key={nombre}
                  style={[
                    styles.button,
                    {
                      backgroundColor: bloqueado ? "#ccc" : colors.button,
                      opacity: bloqueado ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => (bloqueado ? null : handleEnfoqueSelect(obj))}
                  disabled={bloqueado}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: bloqueado ? "#888" : colors.buttonText },
                    ]}
                  >
                    {nombre} {bloqueado ? "🔒" : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Botón de Cerrar sesión */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("usuario");
          router.replace("/"); // volver al login
        }}
      >
        <Ionicons name="log-out-outline" size={24} color="#EFECE3" />
      </TouchableOpacity>
    </View>
  );
}

const lightColors = {
  background: "#E0DACC",
  title: "#4A70A9",
  subtitle: "#4A70A9",
  card: "#FFF",
  cardTitle: "#4A70A9",
  cardText: "#000",
  button: "#8FABD4",
  buttonText: "#000",
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
  banner: {
    backgroundColor: "#8FABD4",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#EFECE3",
  },
});
