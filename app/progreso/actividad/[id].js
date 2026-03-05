import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import API from "../../services/api";

import MapaMentalGrafico from "../../../components/MapaMentalGrafico";
import MapaMentalZoom from "../../../components/MapaMentalZoom";

import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";

const COLORS = {
  primaryBlue: "#1E56A0",
  lightBlue: "#E1F0FF",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  bgGray: "#F8FAFF",
};

export default function VerActividad() {
  const { id } = useLocalSearchParams();

  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);

  const zoomRef = useRef(null);
  const viewShotRef = useRef(null);

  const cargarActividad = async () => {
    try {
      const res = await API.get(`/actividades/${id}`);
      setActividad(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActividad();
  }, []);

  const descargarMapa = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permiso denegado");
        return;
      }

      const uri = await viewShotRef.current.capture();

      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Mapa guardado en galería");
    } catch (error) {
      console.log(error);
      Alert.alert("Error al guardar mapa");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  if (!actividad) {
    return (
      <View style={styles.loader}>
        <Text>No se encontró la actividad</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{actividad.titulo}</Text>
        </View>

        <View style={styles.content}>
          {/* FLASHCARDS */}
          {actividad.tipo === "flashcard" && (
            <>
              <Text style={styles.section}>Flashcards</Text>

              <FlatList
                data={actividad.flashcards}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Text style={styles.pregunta}>{item.pregunta}</Text>
                    <Text style={styles.respuesta}>{item.respuesta}</Text>
                  </View>
                )}
              />
            </>
          )}

          {/* MAPA MENTAL */}
          {actividad.tipo === "mapa-mental" && (
            <>
              <Text style={styles.section}>Mapa Mental</Text>

              <View style={styles.mapaContainer}>
                <MapaMentalZoom ref={zoomRef}>
                  <ViewShot
                    ref={viewShotRef}
                    options={{ format: "jpg", quality: 1 }}
                  >
                    <View style={styles.canvas}>
                      <MapaMentalGrafico
                        titulo={actividad.titulo}
                        nodos={actividad.nodos || []}
                      />
                    </View>
                  </ViewShot>
                </MapaMentalZoom>
              </View>
            </>
          )}
        </View>

        {/* BOTONES FLOTANTES */}
        {actividad.tipo === "mapa-mental" && (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.focusBtn}
              onPress={() => zoomRef.current?.centrarMapa()}
            >
              <Text style={styles.btnText}>🎯 Enfocar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={descargarMapa}
            >
              <Text style={styles.btnText}>📥 Descargar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgGray,
  },

  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },

  content: {
    padding: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 15,
  },

  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 4,
  },

  pregunta: {
    fontWeight: "bold",
    fontSize: 15,
    color: COLORS.textDark,
  },

  respuesta: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textGray,
  },

  mapaContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 10,
    elevation: 5,
    minHeight: 500,
  },

  canvas: {
    width: 850,
    height: 850,
  },

  buttonsRow: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  focusBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },

  downloadBtn: {
    backgroundColor: COLORS.primaryBlue,
    padding: 14,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
