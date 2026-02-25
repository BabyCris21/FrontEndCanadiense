import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primaryBlue: "#1E56A0",
  accentBlue: "#3B82F6",
  white: "#FFFFFF",
  bgGray: "#F8FAFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  lightBlue: "#E1F0FF",
  incorrecto: "#EF4444",
};

export default function PerfilScreen() {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [usuario, setUsuario] = useState({
    nombre: "Juan",
    apellido: "Pérez",
    celular: "987654321",
    foto: null,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("usuario");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUsuario({
          nombre: parsed.nombre || "Juan",
          apellido: parsed.apellido || "Pérez",
          celular: parsed.telefono || "987654321",
          foto: parsed.foto || null,
        });
      }
    } catch (e) {
      console.log("Error cargando perfil");
    }
  };

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tus fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUsuario({ ...usuario, foto: result.assets[0].uri });
    }
  };

  const cerrarSesion = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER AZUL - IGUAL QUE ALUMNO SCREEN */}
      <View style={styles.topHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <TouchableOpacity onPress={() => setEditando(!editando)}>
            <MaterialCommunityIcons
              name={editando ? "check-bold" : "account-edit"}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {usuario.foto ? (
              <Image source={{ uri: usuario.foto }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={COLORS.primaryBlue} />
              </View>
            )}
            <TouchableOpacity style={styles.camBtn} onPress={seleccionarImagen}>
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userTitle}>
            {usuario.nombre} {usuario.apellido}
          </Text>
          <Text style={styles.userSub}>Estudiante Peruano Canadiense</Text>
        </View>
        <View style={styles.whiteCurve} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Text style={styles.label}>INFORMACIÓN PERSONAL</Text>

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={[styles.input, !editando && styles.inputLocked]}
              value={usuario.nombre}
              editable={editando}
              onChangeText={(t) => setUsuario({ ...usuario, nombre: t })}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Apellido</Text>
            <TextInput
              style={[styles.input, !editando && styles.inputLocked]}
              value={usuario.apellido}
              editable={editando}
              onChangeText={(t) => setUsuario({ ...usuario, apellido: t })}
            />
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Teléfono Celular</Text>
            <TextInput
              style={[styles.input, !editando && styles.inputLocked]}
              value={usuario.celular}
              keyboardType="phone-pad"
              editable={editando}
              onChangeText={(t) => setUsuario({ ...usuario, celular: t })}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFB800" />
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statTitle}>Logros</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF5C00" />
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statTitle}>Racha</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={cerrarSesion}>
          <Ionicons
            name="log-out-outline"
            size={22}
            color={COLORS.incorrecto}
          />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* TAB BAR INFERIOR - CSS CLONADO DE ALUMNOSCREEN */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/alumno")}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("enfoqueAcademico")}
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

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person" size={24} color={COLORS.primaryBlue} />
          <Text
            style={[
              styles.tabText,
              { color: COLORS.primaryBlue, fontWeight: "700" },
            ]}
          >
            Perfil
          </Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  topHeader: {
    backgroundColor: COLORS.primaryBlue,
    height: Platform.OS === "ios" ? 280 : 260, // Ajustado para perfil
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 35,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  backBtn: { padding: 5 },
  avatarSection: { alignItems: "center", marginTop: 15, zIndex: 10 },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 50 },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  camBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accentBlue,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userTitle: { color: "white", fontSize: 20, fontWeight: "800", marginTop: 12 },
  userSub: { color: COLORS.lightBlue, fontSize: 13, fontWeight: "600" },
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
  infoCard: {
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginTop: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.textGray,
    marginBottom: 20,
    letterSpacing: 1,
  },
  inputBox: { marginBottom: 15 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFF",
    padding: 14,
    borderRadius: 15,
    fontSize: 15,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputLocked: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingLeft: 0,
    color: COLORS.textGray,
  },
  statsRow: { flexDirection: "row", gap: 15, marginTop: 20 },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  statNum: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 5,
  },
  statTitle: { fontSize: 12, color: COLORS.textGray, fontWeight: "600" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
    padding: 15,
  },
  logoutText: { color: COLORS.incorrecto, fontWeight: "700", fontSize: 16 },

  // TAB BAR COPIADO EXACTAMENTE
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
