import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "./services/api"; // <-- ajusta la ruta si es necesario

const COLORS = {
  primaryBlue: "#2C5EA8",
  lightBlue: "#DCE8F5",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#7A8CA5",
  academico: "#3B82F6",
  organizativo: "#F59E0B",
  estrategico: "#10B981",
};

export default function AlumnoScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [enfoques, setEnfoques] = useState([]);

  useEffect(() => {
    cargarUsuario();
    cargarEnfoques();
  }, []);

  const cargarUsuario = async () => {
    try {
      const data = await AsyncStorage.getItem("usuario");
      if (data) {
        const parsed = JSON.parse(data);
        console.log("👤 Usuario cargado:", parsed);
        setUsuario(parsed);
      }
    } catch (e) {
      console.log("❌ Error cargando usuario:", e);
    }
  };

  const cargarEnfoques = async () => {
    try {
      const res = await API.get("/enfoques");
      console.log("📥 Enfoques recibidos:", res.data);
      setEnfoques(res.data);
    } catch (error) {
      console.log(
        "❌ Error cargando enfoques:",
        error?.response?.data || error,
      );
    }
  };

  const seleccionarEnfoque = async (enfoque) => {
    try {
      const stored = await AsyncStorage.getItem("usuario");
      const user = JSON.parse(stored);

      const alumnoId = user.id || user._id;

      console.log("👤 Usuario:", alumnoId);
      console.log("📌 Enfoque seleccionado:", enfoque);

      const res = await API.post("/alumno-enfoque/set", {
        alumnoId: alumnoId,
        enfoqueId: enfoque._id,
      });

      console.log("✅ Guardado:", res.data);

      // guardar enfoque activo localmente
      await AsyncStorage.setItem(
        "enfoque_activo",
        JSON.stringify(res.data.data),
      );

      // 🔹 NAVEGACIÓN SEGÚN ENFOQUE
      if (enfoque.nombre === "Enfoque Académico") {
        router.push("/enfoqueAcademico");
      } else if (enfoque.nombre === "Enfoque de Organización Personal") {
        router.push("/enfoqueOrganizacion");
      } else if (enfoque.nombre === "Enfoque Estratégico de Estudio") {
        router.push("/enfoqueEstrategico");
      }
    } catch (error) {
      console.log("❌ Error guardando enfoque:", error.response?.data);
    }
  };

  const cerrarSesion = () => {
    Alert.alert("Cerrar Sesión", "¿Deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("usuario");
          await AsyncStorage.removeItem("enfoque_activo");
          router.replace("/");
        },
      },
    ]);
  };

  const getColor = (nombre = "") => {
    if (nombre.includes("Académico")) return COLORS.academico;
    if (nombre.includes("Organización")) return COLORS.organizativo;
    return COLORS.estrategico;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* HEADER */}
      <View style={styles.topHeader}>
        <Text style={styles.logoTitle}>Panel de Control</Text>
        <View style={styles.whiteCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeName}>
            Hola, {usuario?.nombre || "Estudiante"} 👋
          </Text>
          <Text style={styles.welcomeSub}>
            Selecciona tu enfoque de estudio
          </Text>
        </View>

        {/* LISTA DE ENFOQUES */}
        <View style={styles.enfoquesList}>
          {enfoques.map((item) => {
            const color = getColor(item.nombre);
            return (
              <TouchableOpacity
                key={item._id}
                style={[styles.card, { borderLeftColor: color }]}
                onPress={() => seleccionarEnfoque(item)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.cardImageSpace,
                    { backgroundColor: color + "20" },
                  ]}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.nombre}</Text>
                  <Text style={styles.cardSubText}>
                    {item.descripcion
                      ? item.descripcion.substring(0, 70) + "..."
                      : "Selecciona este enfoque"}
                  </Text>
                </View>
                <View style={[styles.arrowBtn, { backgroundColor: color }]}>
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTÓN FLOTANTE CERRAR SESIÓN */}
      <TouchableOpacity
        style={styles.fabLogout}
        onPress={cerrarSesion}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out" size={26} color="white" />
      </TouchableOpacity>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color={COLORS.primaryBlue} />
          <Text style={[styles.tabText, { color: COLORS.primaryBlue }]}>
            Inicio
          </Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/enfoqueAcademico")}
        >
          <Ionicons
            name="document-text-outline"
            size={24}
            color={COLORS.textGray}
          />
          <Text style={styles.tabText}>Ejercicios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/perfil")}
        >
          <Ionicons name="person-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  topHeader: {
    backgroundColor: COLORS.primaryBlue,
    height: 110,
    paddingHorizontal: 20,
    paddingTop: 45,
  },

  logoTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  whiteCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: "white",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },

  welcomeBanner: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },

  welcomeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
  },

  welcomeSub: {
    fontSize: 14,
    color: COLORS.textGray,
  },

  enfoquesList: { gap: 18 },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    elevation: 3,
  },

  cardImageSpace: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },

  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
  },

  cardSubText: {
    fontSize: 12,
    color: COLORS.textGray,
  },

  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  fabLogout: {
    position: "absolute",
    bottom: 95,
    right: 20,
    backgroundColor: "#EF4444",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

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
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: COLORS.textGray,
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primaryBlue,
    marginTop: 4,
  },
});
