import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import API from "../services/api";

import { AnimatedCircularProgress } from "react-native-circular-progress";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const COLORS = {
  primaryBlue: "#1E56A0",
  textDark: "#2D4B7A",
  textGray: "#718096",
  bgGray: "#F8FAFF",
};

export default function ReporteAlumno() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarActividades = async () => {
    try {
      const res = await API.get(`/actividades/usuario/${id}`);
      setActividades(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  const flashcards = actividades.filter((a) => a.tipo === "flashcard");
  const mapas = actividades.filter((a) => a.tipo === "mapa-mental");

  const flashGoal = 4;
  const mapaGoal = 2;

  const flashProgress = Math.min(flashcards.length / flashGoal, 1);
  const mapaProgress = Math.min(mapas.length / mapaGoal, 1);
  const generalProgress = (flashProgress + mapaProgress) / 2;

  const porcentajeGeneral = Math.round(generalProgress * 100);

  const getEmoji = (value) => {
    if (value < 0.4) return "😢";
    if (value < 0.8) return "🙂";
    return "😃";
  };

  const obtenerSugerencia = (porcentaje) => {
    if (porcentaje >= 90)
      return "Excelente desempeño. El estudiante demuestra dominio del contenido.";

    if (porcentaje >= 70)
      return "Buen progreso. Continúe practicando para consolidar el aprendizaje.";

    if (porcentaje >= 40)
      return "Progreso moderado. Se recomienda reforzar las actividades.";

    return "Progreso bajo. Se recomienda aumentar la constancia en las actividades.";
  };

  const generarPDF = async () => {
    const fecha = new Date();

    const html = `
    <html>
    <body style="font-family: Arial; padding:40px">

    <h1 style="color:#1E56A0">Reporte de Progreso</h1>

    <h3>Datos del estudiante</h3>

    <p>ID Alumno: ${id}</p>
    <p>Fecha del reporte: ${fecha.toLocaleDateString()}</p>
    <p>Hora: ${fecha.toLocaleTimeString()}</p>

    <hr/>

    <h3>Progreso</h3>

    <p>Flashcards realizadas: ${flashcards.length}</p>
    <p>Mapas mentales realizados: ${mapas.length}</p>
    <p>Progreso general: ${porcentajeGeneral}%</p>

    <h3>Sugerencias</h3>

    <p>${obtenerSugerencia(porcentajeGeneral)}</p>

    <h3>Historial de actividades</h3>

    <table border="1" cellspacing="0" cellpadding="8">
    <tr>
    <th>Tipo</th>
    <th>Titulo</th>
    <th>Fecha</th>
    </tr>

    ${actividades
      .map(
        (a) => `
    <tr>
    <td>${a.tipo}</td>
    <td>${a.titulo}</td>
    <td>${new Date(a.createdAt).toLocaleDateString()}</td>
    </tr>
    `,
      )
      .join("")}

    </table>

    </body>
    </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>Reporte del Alumno</Text>
        </View>

        {/* RESUMEN */}

        <View style={styles.statsContainer}>
          <Stat
            icon="cards-outline"
            value={flashcards.length}
            label="Flashcards"
          />

          <Stat icon="graph-outline" value={mapas.length} label="Mapas" />

          <Stat
            icon="analytics-outline"
            value={actividades.length}
            label="Total"
          />
        </View>

        {/* FLASHCARDS */}

        {flashcards.length > 0 && (
          <>
            <Text style={styles.section}>Flashcards</Text>

            {flashcards.map((item) => (
              <ItemCard
                key={item._id}
                icon="cards-outline"
                title={item.titulo}
                date={item.createdAt}
                onPress={() => router.push(`/progreso/actividad/${item._id}`)}
              />
            ))}
          </>
        )}

        {/* MAPAS */}

        {mapas.length > 0 && (
          <>
            <Text style={styles.section}>Mapas Mentales</Text>

            {mapas.map((item) => (
              <ItemCard
                key={item._id}
                icon="graph-outline"
                title={item.titulo}
                date={item.createdAt}
                onPress={() => router.push(`/progreso/actividad/${item._id}`)}
              />
            ))}
          </>
        )}

        {/* PROGRESO */}

        <Text style={styles.section}>Progreso del estudiante</Text>

        <View style={styles.progressRow}>
          <Circle value={flashProgress} label="Flashcards" />

          <Circle value={mapaProgress} label="Mapas" />

          <Circle value={generalProgress} label="General" />
        </View>

        <Text style={styles.progressText}>
          Avance total: {porcentajeGeneral}% {getEmoji(generalProgress)}
        </Text>

        <Text style={styles.sugerencia}>
          {obtenerSugerencia(porcentajeGeneral)}
        </Text>

        {/* BOTON PDF */}

        <TouchableOpacity style={styles.reportBtn} onPress={generarPDF}>
          <Text style={styles.reportText}>Generar reporte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stat = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#1E56A0" />

    <Text style={styles.statNumber}>{value}</Text>

    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ItemCard = ({ icon, title, date, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={22} color="#1E56A0" />

    <View style={{ marginLeft: 10 }}>
      <Text style={styles.cardTitle}>{title}</Text>

      <Text style={styles.cardDate}>{new Date(date).toLocaleDateString()}</Text>
    </View>
  </TouchableOpacity>
);

const Circle = ({ value, label }) => {
  const percent = Math.round(value * 100);

  return (
    <View style={styles.circleContainer}>
      <AnimatedCircularProgress
        size={95}
        width={10}
        fill={percent}
        tintColor="#1E56A0"
        backgroundColor="#E5E7EB"
      >
        {() => <Text style={styles.percent}>{percent}%</Text>}
      </AnimatedCircularProgress>

      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },

  container: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: "#1E56A0",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -20,
  },

  statCard: {
    backgroundColor: "white",
    width: 110,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "#718096",
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
    marginLeft: 20,
    color: "#2D4B7A",
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  cardTitle: {
    fontWeight: "bold",
    color: "#2D4B7A",
  },

  cardDate: {
    fontSize: 12,
    color: "#718096",
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },

  circleContainer: {
    alignItems: "center",
  },

  percent: {
    fontSize: 16,
    fontWeight: "bold",
  },

  circleLabel: {
    marginTop: 6,
  },

  progressText: {
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 15,
  },

  sugerencia: {
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 30,
    color: "#555",
  },

  reportBtn: {
    backgroundColor: "#1E56A0",
    margin: 25,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },

  reportText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
