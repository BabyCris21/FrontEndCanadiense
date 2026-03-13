import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
  organizativo: "#F59E0B",
};

export default function EnfoqueOrganizacionScreen() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const cargar = async () => {
      const data = await AsyncStorage.getItem("usuario");
      if (data) setUsuario(JSON.parse(data));
    };
    cargar();
  }, []);

  const actividades = [
    {
      id: "1",
      nombre: "Crear Horario Académico",
      sub: "Planifica tus clases, tareas y estudios",
      color: COLORS.academico,
      path: "/actividades/Academico/horarioClases",
    },
    {
      id: "2",
      nombre: "Crear Horario Personal",
      sub: "Organiza tus actividades diarias",
      color: COLORS.organizativo,
      path: "/actividades/Academico/horario",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.logoTitle}>Enfoque Organización</Text>
        </View>

        <View style={styles.whiteCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER */}
        <View style={styles.welcomeBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeName}>
              ¡Organízate, {usuario?.nombre}!
            </Text>

            <Text style={styles.welcomeSub}>
              Estas son tus herramientas de planificación
            </Text>
          </View>
        </View>

        {/* ACTIVIDADES */}
        <View style={styles.enfoquesList}>
          {actividades.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                { borderLeftWidth: 5, borderLeftColor: item.color },
              ]}
              onPress={() => router.push(item.path)}
            >
              <View
                style={[
                  styles.cardImageSpace,
                  { backgroundColor: item.color + "15" },
                ]}
              />

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                <Text style={styles.cardSubText}>{item.sub}</Text>
              </View>

              <View style={[styles.arrowBtn, { backgroundColor: item.color }]}>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/alumno")}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="document-text" size={24} color={COLORS.primaryBlue} />
          <Text
            style={[
              styles.tabText,
              { color: COLORS.primaryBlue, fontWeight: "700" },
            ]}
          >
            Ejercicios
          </Text>
          <View style={styles.activeDot} />
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

  headerRow: { flexDirection: "row", alignItems: "center" },

  backBtn: { marginRight: 15 },

  logoTitle: { color: "white", fontSize: 18, fontWeight: "bold" },

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

  scrollContent: { padding: 20, paddingBottom: 100 },

  welcomeBanner: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  welcomeName: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },

  welcomeSub: { fontSize: 14, color: COLORS.textGray },

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
  },

  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "white",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  tabItem: { flex: 1, alignItems: "center", justifyContent: "center" },

  tabText: { fontSize: 11, marginTop: 4 },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primaryBlue,
    marginTop: 4,
  },
});
