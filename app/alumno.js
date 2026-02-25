import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
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
  // Colores de los enfoques
  academico: "#3B82F6",
  saludable: "#10B981",
  organizativo: "#F59E0B",
  bgLight: "#F8FAFF",
};

export default function AlumnoScreen() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const cargarUsuario = async () => {
      const data = await AsyncStorage.getItem("usuario");
      if (data) setUsuario(JSON.parse(data));
    };
    cargarUsuario();
  }, []);

  // Definimos los 3 enfoques fijos como en la imagen
  const enfoquesFijos = [
    {
      id: "1",
      nombre: "Enfoque Académico",
      sub: "Mejora tu rendimiento",
      color: COLORS.academico,
      path: "/enfoqueAcademico",
    },
    {
      id: "2",
      nombre: "Enfoque Saludable",
      sub: "Cuida tu bienestar",
      color: COLORS.saludable,
      path: "/enfoqueSaludable",
    },
    {
      id: "3",
      nombre: "Enfoque Organizativo",
      sub: "Más orden, mejores resultados",
      color: COLORS.organizativo,
      path: "/enfoqueOrganizativo",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER AZUL - Ajustado por el Notch */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <View style={styles.logoContainer}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={22}
                color={COLORS.primaryBlue}
              />
            </View>
            <View>
              <Text style={styles.logoTitle}>EstudiaSmart</Text>
              <Text style={styles.logoSubtitle}>Hábitos que te impulsan</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifContainer}>
            <Ionicons name="notifications" size={24} color="white" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>
        <View style={styles.whiteCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* BANNER BIENVENIDA */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeTextColumn}>
            <Text style={styles.welcomeName}>
              Hola,{" "}
              <Text style={{ color: COLORS.primaryBlue }}>
                {usuario?.nombre || "Manuel"}
              </Text>{" "}
              👋
            </Text>
            <Text style={styles.welcomeSub}>
              Selecciona tu enfoque de estudio
            </Text>
          </View>
          {/* Espacio para imagen del niño estudiando */}
          <View style={styles.imageSpaceHeader} />
        </View>

        {/* LISTA DE 3 ENFOQUES */}
        <View style={styles.enfoquesList}>
          {enfoquesFijos.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                { borderLeftWidth: 5, borderLeftColor: item.color },
              ]}
              onPress={() => router.push(item.path)}
              activeOpacity={0.8}
            >
              {/* Espacio para la ilustración de cada enfoque */}
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

        {/* Espacio para ilustración de libros del final */}
        <View style={styles.footerIllustrationSpace} />
      </ScrollView>

      {/* TAB BAR INFERIOR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/alumno")}
        >
          <Ionicons name="home" size={24} color={COLORS.primaryBlue} />
          <Text
            style={[
              styles.tabText,
              { color: COLORS.primaryBlue, fontWeight: "700" },
            ]}
          >
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

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons
            name="bar-chart-outline"
            size={24}
            color={COLORS.textGray}
          />
          <Text style={styles.tabText}>Progreso</Text>
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
  container: { flex: 1, backgroundColor: COLORS.white },
  topHeader: {
    backgroundColor: COLORS.primaryBlue,
    height: Platform.OS === "ios" ? 145 : 125, // Margen para el Notch
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 35, // Margen para el Notch
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    backgroundColor: "white",
    padding: 7,
    borderRadius: 10,
    marginRight: 12,
  },
  logoTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  logoSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "400",
  },
  notifContainer: { padding: 5 },
  notifBadge: {
    position: "absolute",
    top: 5,
    right: 8,
    backgroundColor: "#FF5252",
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBlue,
  },
  whiteCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },

  welcomeBanner: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 25,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  welcomeTextColumn: { flex: 1 },
  welcomeName: { fontSize: 22, fontWeight: "700", color: COLORS.textDark },
  welcomeSub: { fontSize: 14, color: COLORS.textGray, marginTop: 4 },
  imageSpaceHeader: {
    width: 85,
    height: 85,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },

  enfoquesList: { gap: 16 },
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    // Sombreado IDÉNTICO a la imagen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardImageSpace: {
    width: 65,
    height: 65,
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.textDark },
  cardSubText: { fontSize: 13, color: COLORS.textGray, marginTop: 3 },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  footerIllustrationSpace: {
    width: "100%",
    height: 130,
    marginTop: 25,
    backgroundColor: "#F8FAFF",
    borderRadius: 25,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    paddingBottom: Platform.OS === "ios" ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 15,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabText: { fontSize: 12, color: COLORS.textGray, marginTop: 4 },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primaryBlue,
    marginTop: 4,
  },
});
