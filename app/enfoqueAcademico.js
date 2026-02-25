import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  accentBlue: "#3B82F6",
  bgGray: "#F8FAFF",
};

export default function EnfoqueAcademico() {
  const router = useRouter();

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER AZUL - IDÉNTICO A ALUMNO.JS */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Enfoque Académico</Text>

          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="bookshelf"
              size={22}
              color={COLORS.primaryBlue}
            />
          </View>
        </View>
        <View style={styles.whiteCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.line} />
          <Text style={styles.sectionTitle}>EJERCICIOS DISPONIBLES</Text>
          <View style={styles.line} />
        </View>

        {/* 1. Flashcards */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push("/actividades/Academico/Flashcards")}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardImagePlaceholder}>
              <Ionicons
                name="copy-outline"
                size={28}
                color={COLORS.accentBlue}
              />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Flashcards</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>12 Actividades</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Memoriza conceptos claves usando tarjetas interactivas de forma
            rápida y sencilla.
          </Text>
          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>Iniciar</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </View>
        </TouchableOpacity>

        {/* 2. Mapa Mental */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push("/actividades/Academico/MapaMental")}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.cardImagePlaceholder,
                { backgroundColor: "#E8F5E9" },
              ]}
            >
              <MaterialCommunityIcons
                name="hubspot"
                size={28}
                color="#10B981"
              />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Mapas Mentales</Text>
              <View style={[styles.badge, { backgroundColor: "#E8F5E9" }]}>
                <Text style={[styles.badgeText, { color: "#10B981" }]}>
                  8 Actividades
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Organiza ideas y conecta conceptos visualmente para mejorar tu
            comprensión.
          </Text>
          <View style={[styles.startButton, { backgroundColor: "#10B981" }]}>
            <Text style={styles.startButtonText}>Iniciar</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* TAB BAR - IDÉNTICO A ALUMNO.JS */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/alumno")}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabLabel}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="document-text" size={24} color={COLORS.primaryBlue} />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>
            Ejercicios
          </Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons
            name="bar-chart-outline"
            size={24}
            color={COLORS.textGray}
          />
          <Text style={styles.tabLabel}>Progreso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/perfil")}
        >
          <Ionicons name="person-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },

  // Header copiado exactamente de AlumnoScreen
  header: {
    backgroundColor: COLORS.primaryBlue,
    height: Platform.OS === "ios" ? 145 : 125,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 35,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { padding: 5 },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    marginLeft: 10,
  },
  iconBox: {
    backgroundColor: "white",
    padding: 7,
    borderRadius: 10,
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

  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: "#F1F5F9" },
  sectionTitle: {
    marginHorizontal: 15,
    color: COLORS.textGray,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },

  // Tarjetas con el mismo estilo de sombreado y bordes
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  cardImagePlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleContainer: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },
  badge: {
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgeText: { fontSize: 11, color: COLORS.primaryBlue, fontWeight: "700" },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-end",
    paddingHorizontal: 20,
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 14,
  },

  // Tab Bar igual a AlumnoScreen
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
  tabLabel: { fontSize: 12, color: COLORS.textGray, marginTop: 4 },
  tabLabelActive: { color: COLORS.primaryBlue, fontWeight: "700" },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primaryBlue,
    marginTop: 4,
  },
});
