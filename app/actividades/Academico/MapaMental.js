import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";

import MapaMentalGrafico from "../../../components/MapaMentalGrafico";
import MapaMentalZoom from "../../../components/MapaMentalZoom";

const BASE_URL = "https://appcanadiense.onrender.com";

const COLORS = {
  primaryBlue: "#1E56A0",
  lightBlue: "#E1F0FF",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  accentBlue: "#3B82F6",
  delete: "#EF4444",
  edit: "#F59E0B",
  bgGray: "#F8FAFF",
};

export default function MapaMental() {
  const router = useRouter();
  const viewShotRef = useRef();
  const zoomRef = useRef(null);

  const [usuarioId, setUsuarioId] = useState(null);
  const [enfoqueId, setEnfoqueId] = useState(null);
  const [mapas, setMapas] = useState([]);
  const [verMapaPreview, setVerMapaPreview] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editarMapaId, setEditarMapaId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nodos, setNodos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = await AsyncStorage.getItem("usuario");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        setUsuarioId(user.id);

        const rEnfoque = await fetch(
          `${BASE_URL}/api/alumno-enfoque/${user.id}`,
        );
        const jEnfoque = await rEnfoque.json();
        if (jEnfoque?.enfoqueId?._id) setEnfoqueId(jEnfoque.enfoqueId._id);

        const rMapas = await fetch(
          `${BASE_URL}/api/actividades/mapa-mental/usuario/${user.id}`,
        );
        const jMapas = await rMapas.json();
        setMapas(jMapas || []);
      } catch (error) {
        console.log("INIT ERROR", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (verMapaPreview) {
      setTimeout(() => zoomRef.current?.reset(), 600);
    }
  }, [verMapaPreview]);

  const agregarNodo = () =>
    setNodos((prev) => [...prev, { titulo: "", descripcion: "" }]);
  const actualizarNodo = (index, campo, valor) => {
    const copia = [...nodos];
    copia[index][campo] = valor;
    setNodos(copia);
  };
  const eliminarNodoForm = (index) =>
    setNodos((prev) => prev.filter((_, i) => i !== index));

  const descargarMapa = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a la galería.");
        return;
      }
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("¡Guardado!", "Imagen guardada correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo generar la imagen.");
    }
  };

  const eliminarMapa = (id) => {
    Alert.alert("Eliminar Mapa", "¿Deseas borrar este proyecto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${BASE_URL}/api/actividades/${id}/mapa-mental`, {
              method: "DELETE",
            });
            setMapas((prev) => prev.filter((m) => m._id !== id));
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  const guardarMapaMental = async () => {
    if (!titulo.trim() || nodos.length === 0) {
      Alert.alert("Error", "Agrega un título y al menos un nodo");
      return;
    }
    setLoading(true);
    try {
      let actividadId = editarMapaId;
      if (!editarMapaId) {
        const resAct = await fetch(`${BASE_URL}/api/actividades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            enfoqueId,
            tipo: "mapa-mental",
            titulo,
            descripcion,
          }),
        });
        const act = await resAct.json();
        actividadId = act.actividad._id;
        await fetch(`${BASE_URL}/api/actividades/${actividadId}/mapa-mental`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodos }),
        });
        setMapas((prev) => [{ ...act.actividad, nodos }, ...prev]);
      } else {
        await fetch(`${BASE_URL}/api/actividades/${actividadId}/mapa-mental`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, descripcion, nodos }),
        });
        setMapas((prev) => [
          { _id: actividadId, titulo, descripcion, nodos },
          ...prev.filter((m) => m._id !== actividadId),
        ]);
      }
      setMostrarFormulario(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* HEADER IDÉNTICO AL QUE PASASTE */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Mapas Mentales</Text>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="hubspot"
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
          <Text style={styles.sectionTitle}>MIS CREACIONES</Text>
          <View style={styles.line} />
        </View>

        {mapas.map((mapa) => (
          <View key={mapa._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardImagePlaceholder}>
                <MaterialCommunityIcons
                  name="hubspot"
                  size={28}
                  color={COLORS.accentBlue}
                />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{mapa.titulo}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {mapa.nodos?.length || 0} Conceptos
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => setVerMapaPreview(mapa)}
                style={styles.actionBtn}
              >
                <Ionicons
                  name="eye-outline"
                  size={20}
                  color={COLORS.primaryBlue}
                />
                <Text style={styles.actionBtnText}>Ver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditarMapaId(mapa._id);
                  setTitulo(mapa.titulo);
                  setDescripcion(mapa.descripcion || "");
                  setNodos(mapa.nodos || []);
                  setMostrarFormulario(true);
                }}
                style={styles.actionBtn}
              >
                <Ionicons name="pencil-outline" size={20} color={COLORS.edit} />
                <Text style={[styles.actionBtnText, { color: COLORS.edit }]}>
                  Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => eliminarMapa(mapa._id)}
                style={styles.actionBtn}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={COLORS.delete}
                />
                <Text style={[styles.actionBtnText, { color: COLORS.delete }]}>
                  Borrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.mainCreateBtn}
          onPress={() => {
            setEditarMapaId(null);
            setTitulo("");
            setDescripcion("");
            setNodos([{ titulo: "", descripcion: "" }]);
            setMostrarFormulario(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.mainCreateBtnText}>Crear Nuevo Mapa</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* TAB BAR IDÉNTICO AL QUE PASASTE */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/AlumnoScreen")}
        >
          <Ionicons name="home-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabLabel}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/actividades/Academico/EnfoqueAcademico")}
        >
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

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color={COLORS.textGray} />
          <Text style={styles.tabLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* MODALES IGUALES */}
      <Modal visible={!!verMapaPreview} animationType="fade">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.bgGray }}>
            <View style={styles.floatingHeader}>
              <TouchableOpacity
                onPress={() => setVerMapaPreview(null)}
                style={styles.circleBtn}
              >
                <Ionicons name="close" size={28} color={COLORS.delete} />
              </TouchableOpacity>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => zoomRef.current?.reset()}
                  style={[
                    styles.circleBtn,
                    { backgroundColor: COLORS.primaryBlue },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="target"
                    size={26}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={descargarMapa}
                  style={[
                    styles.circleBtn,
                    { backgroundColor: COLORS.primaryBlue },
                  ]}
                >
                  <Ionicons name="download-outline" size={26} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <MapaMentalZoom ref={zoomRef}>
              <ViewShot
                ref={viewShotRef}
                options={{ format: "jpg", quality: 1.0 }}
                style={styles.canvas}
              >
                {verMapaPreview && (
                  <MapaMentalGrafico
                    titulo={verMapaPreview.titulo}
                    nodos={verMapaPreview.nodos || []}
                  />
                )}
              </ViewShot>
            </MapaMentalZoom>
          </View>
        </GestureHandlerRootView>
      </Modal>

      <Modal visible={mostrarFormulario} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View style={styles.modalTopBar}>
            <Text style={styles.modalTitle}>
              {editarMapaId ? "Editar Mapa" : "Nuevo Mapa"}
            </Text>
            <TouchableOpacity onPress={() => setMostrarFormulario(false)}>
              <Ionicons name="close" size={30} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <TextInput
              style={styles.input}
              placeholder="Título del mapa"
              value={titulo}
              onChangeText={setTitulo}
            />
            <View style={styles.formSectionRow}>
              <Text style={styles.formLabel}>Conceptos / Nodos</Text>
              <TouchableOpacity onPress={agregarNodo}>
                <Ionicons
                  name="add-circle"
                  size={28}
                  color={COLORS.primaryBlue}
                />
              </TouchableOpacity>
            </View>
            {nodos.map((n, i) => (
              <View key={i} style={styles.nodeCard}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ fontWeight: "bold", color: COLORS.primaryBlue }}
                  >
                    Idea #{i + 1}
                  </Text>
                  <TouchableOpacity onPress={() => eliminarNodoForm(i)}>
                    <Ionicons name="trash" size={18} color={COLORS.delete} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.nodeInput}
                  placeholder="Subtítulo"
                  value={n.titulo}
                  onChangeText={(v) => actualizarNodo(i, "titulo", v)}
                />
                <TextInput
                  style={[styles.nodeInput, { borderBottomWidth: 0 }]}
                  placeholder="Breve descripción"
                  value={n.descripcion}
                  onChangeText={(v) => actualizarNodo(i, "descripcion", v)}
                  multiline
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={guardarMapaMental}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "Guardando..." : "Guardar Mapa Mental"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
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
  iconBox: { backgroundColor: "white", padding: 7, borderRadius: 10 },
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

  scrollContainer: { paddingHorizontal: 20, paddingBottom: 110 },
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

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 15,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.primaryBlue },

  mainCreateBtn: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 15,
    gap: 10,
    marginTop: 10,
  },
  mainCreateBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

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

  // Canvas y Modales
  floatingHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  canvas: { width: 850, height: 850, backgroundColor: "#F8FAFF" },
  modalTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },
  input: {
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  formSectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  formLabel: { fontWeight: "bold", color: COLORS.textDark, fontSize: 16 },
  nodeCard: {
    backgroundColor: "#F8FAFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  nodeInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    paddingVertical: 8,
    marginBottom: 5,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.primaryBlue,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
