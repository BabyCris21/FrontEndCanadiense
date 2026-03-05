import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const url = "http://192.168.18.31:5000";

const COLORS = {
  primaryBlue: "#1E56A0",
  lightBlue: "#E1F0FF",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  academico: "#3B82F6",
  organizacion: "#F59E0B",
};

export default function SeleccionEnfoqueScreen() {
  const [usuario, setUsuario] = useState(null);
  const [enfoqueActual, setEnfoqueActual] = useState(null);
  const [enfoques, setEnfoques] = useState([]);
  const [cargando, setCargando] = useState(true);

  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await AsyncStorage.getItem("usuario");
      const user = data ? JSON.parse(data) : null;
      setUsuario(user);

      if (user) {
        const resEnfoque = await fetch(
          `${url}/api/alumno-enfoque/${user.id || user._id}`,
        );
        const jsonEnfoque = await resEnfoque.json();

        if (jsonEnfoque?.enfoqueId?.nombre)
          setEnfoqueActual(jsonEnfoque.enfoqueId.nombre);

        const resTodos = await fetch(`${url}/api/enfoques`);
        const jsonTodos = await resTodos.json();

        // SOLO 2 ENFOQUES
        const filtrados = jsonTodos.filter(
          (e) =>
            e.nombre === "Enfoque Académico" ||
            e.nombre === "Organización personal",
        );

        setEnfoques(filtrados);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setCargando(false);
    }
  };

  const handleEnfoqueSelect = async (enfoque) => {
    try {
      const res = await fetch(`${url}/api/alumno-enfoque/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          alumnoId: usuario.id || usuario._id,
          enfoqueId: enfoque._id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem("enfoque_activo", JSON.stringify(data.data));

        if (enfoque.nombre === "Enfoque Académico") {
          router.push("/enfoqueAcademico");
        } else {
          router.push("/organizacion");
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (cargando)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* HEADER */}

      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.logoTitle}>Panel de Control</Text>
        </View>

        <View style={styles.whiteCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SALUDO */}

        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeName}>Hola, {usuario?.nombre} 👋</Text>

          <Text style={styles.welcomeSub}>
            Selecciona tu enfoque de estudio
          </Text>
        </View>

        {/* ENFOQUE ACTIVO */}

        {enfoqueActual && (
          <View style={styles.bannerActive}>
            <Text style={styles.bannerText}>
              Enfoque actual: {enfoqueActual}
            </Text>

            <TouchableOpacity
              style={styles.btnResumen}
              onPress={() => router.push("/enfoqueAcademico")}
            >
              <Text style={styles.btnResumenText}>Continuar actividades →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LISTA */}

        <View style={styles.enfoquesList}>
          {enfoques.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.card,
                {
                  borderLeftWidth: 5,
                  borderLeftColor:
                    item.nombre === "Enfoque Académico"
                      ? COLORS.academico
                      : COLORS.organizacion,
                },
              ]}
              onPress={() => handleEnfoqueSelect(item)}
            >
              <View
                style={[
                  styles.cardImageSpace,
                  {
                    backgroundColor:
                      item.nombre === "Enfoque Académico"
                        ? COLORS.academico + "20"
                        : COLORS.organizacion + "20",
                  },
                ]}
              />

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardSubText}>Accede a tus actividades</Text>
              </View>

              <View style={styles.arrowBtn}>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  topHeader: {
    backgroundColor: COLORS.primaryBlue,
    height: 110,
    paddingHorizontal: 20,
    paddingTop: 45,
  },

  headerRow: { flexDirection: "row", alignItems: "center" },

  logoTitle: { color: "white", fontSize: 20, fontWeight: "bold" },

  whiteCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "white",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  scrollContent: { padding: 20, paddingBottom: 60 },

  welcomeBanner: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  welcomeName: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },

  welcomeSub: { fontSize: 14, color: COLORS.textGray },

  bannerActive: {
    backgroundColor: "#F8FAFF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 25,
  },

  bannerText: { color: COLORS.textDark, fontWeight: "600" },

  btnResumen: {
    backgroundColor: COLORS.primaryBlue,
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },

  btnResumenText: { color: "white", fontWeight: "bold" },

  enfoquesList: { gap: 15 },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },

  cardImageSpace: { width: 50, height: 50, borderRadius: 12 },

  cardInfo: { flex: 1, marginLeft: 15 },

  cardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textDark },

  cardSubText: { fontSize: 12, color: COLORS.textGray },

  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryBlue,
  },

  logoutBtn: { marginTop: 30, alignItems: "center" },

  logoutText: { color: "#E53935", fontWeight: "bold" },
});
