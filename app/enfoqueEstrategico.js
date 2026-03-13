import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const COLORS = {
  primaryBlue: "#2C5EA8",
  lightBlue: "#DCE8F5",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#7A8CA5",
  estrategico: "#10B981",
};

export default function EnfoqueEstrategico() {
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);

  const videos = [
    {
      titulo: "Técnicas de estudio",
      id: "A4KnrbHVyIA",
    },
    {
      titulo: "Cómo mejorar los hábitos de estudio",
      id: "OaDFHoFECOc",
    },
    {
      titulo: "Cómo evitar distracciones al estudiar",
      id: "x2caFEUK6zg",
    },
    {
      titulo: "Cómo concentrarse al estudiar",
      id: "TpfjkBxAECs",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* HEADER */}
      <View style={styles.topHeader}>
        <Text style={styles.logoTitle}>Enfoque Estratégico</Text>
        <View style={styles.whiteCurve} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BANNER */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Tips para mejorar tu concentración
          </Text>
          <Text style={styles.bannerSub}>
            Aprende estrategias para estudiar mejor
          </Text>
        </View>

        {/* VIDEO PLAYER */}
        {videoSeleccionado && (
          <View style={styles.videoContainer}>
            <YoutubePlayer
              height={220}
              play={false}
              videoId={videoSeleccionado}
            />
          </View>
        )}

        {/* LISTA DE VIDEOS */}
        <View style={styles.videosList}>
          {videos.map((video, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => setVideoSeleccionado(video.id)}
            >
              <View
                style={[
                  styles.cardImageSpace,
                  { backgroundColor: COLORS.estrategico + "20" },
                ]}
              />

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{video.titulo}</Text>
                <Text style={styles.cardSubText}>Ver tip educativo</Text>
              </View>

              <View style={styles.arrowBtn}>
                <Ionicons name="play" size={16} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 40,
  },

  banner: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
  },

  bannerSub: {
    fontSize: 14,
    color: COLORS.textGray,
  },

  videoContainer: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
  },

  videosList: {
    gap: 18,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: COLORS.estrategico,
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
    backgroundColor: COLORS.estrategico,
  },
});
