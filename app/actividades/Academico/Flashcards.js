import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://appcanadiense.onrender.com";

const COLORS = {
  primaryBlue: "#1E56A0",
  lightBlue: "#E1F0FF",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  academico: "#3B82F6",
};

export default function FlashcardsScreen() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [actividadId, setActividadId] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [editando, setEditando] = useState(null);

  const [mostrar, setMostrar] = useState({});

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const data = await AsyncStorage.getItem("usuario");
      const user = JSON.parse(data);

      setUsuario(user);

      const rEnfoque = await fetch(`${BASE_URL}/api/alumno-enfoque/${user.id}`);

      const jEnfoque = await rEnfoque.json();
      const enfoqueId = jEnfoque.enfoqueId._id;

      const rAct = await fetch(
        `${BASE_URL}/api/actividades/flashcard/${enfoqueId}?usuarioId=${user.id}`,
      );

      const act = await rAct.json();

      if (act) {
        console.log("Flashcards cargadas:", act.flashcards);
        setActividadId(act._id);
        setFlashcards(act.flashcards);
      }

      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  /* =========================
     CREAR FLASHCARD
  ========================= */

  const crearFlashcard = async () => {
    console.log("➕ creando flashcard");

    await fetch(`${BASE_URL}/api/actividades/${actividadId}/flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flashcards: [{ pregunta, respuesta }],
      }),
    });

    setPregunta("");
    setRespuesta("");
    setModalVisible(false);

    cargar();
  };

  /* =========================
     EDITAR FLASHCARD
  ========================= */

  const editarFlashcard = async () => {
    console.log("✏️ editando flashcard", editando);

    await fetch(
      `${BASE_URL}/api/actividades/${actividadId}/flashcards/${editando}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, respuesta }),
      },
    );

    setEditando(null);
    setModalVisible(false);
    setPregunta("");
    setRespuesta("");

    cargar();
  };

  /* =========================
     ELIMINAR FLASHCARD
  ========================= */

  const eliminarFlashcard = async (id) => {
    console.log("🗑 eliminando flashcard", id);

    await fetch(`${BASE_URL}/api/actividades/${actividadId}/flashcards/${id}`, {
      method: "DELETE",
    });

    cargar();
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

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

          <Text style={styles.logoTitle}>Flashcards rápidas</Text>
        </View>

        <View style={styles.whiteCurve} />
      </View>

      {/* CONTENIDO */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {flashcards.map((f) => (
          <View key={f._id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{f.pregunta}</Text>

              {mostrar[f._id] ? (
                <Text style={styles.cardSubText}>{f.respuesta}</Text>
              ) : (
                <TouchableOpacity
                  onPress={() => setMostrar({ ...mostrar, [f._id]: true })}
                >
                  <Text style={{ color: COLORS.academico }}>
                    Mostrar respuesta
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => {
                setEditando(f._id);
                setPregunta(f.pregunta);
                setRespuesta(f.respuesta);
                setModalVisible(true);
              }}
            >
              <Ionicons name="pencil" size={20} color={COLORS.academico} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => eliminarFlashcard(f._id)}>
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* BOTON NUEVA TARJETA */}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Nueva Flashcard
        </Text>
      </TouchableOpacity>

      {/* MODAL */}

      <Modal visible={modalVisible} animationType="slide">
        <View style={{ padding: 25, marginTop: 100 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            {editando ? "Editar Flashcard" : "Nueva Flashcard"}
          </Text>

          <TextInput
            placeholder="Pregunta"
            style={styles.input}
            value={pregunta}
            onChangeText={setPregunta}
          />

          <TextInput
            placeholder="Respuesta"
            style={styles.input}
            value={respuesta}
            onChangeText={setRespuesta}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              if (editando) editarFlashcard();
              else crearFlashcard();
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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

/* =========================
   ESTILOS
========================= */

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

  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    marginBottom: 15,
    gap: 10,
  },

  cardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textDark },

  cardSubText: { fontSize: 13, color: COLORS.textGray },

  addBtn: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: COLORS.academico,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  input: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: COLORS.primaryBlue,
    padding: 16,
    borderRadius: 12,
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
