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

import { AnimatedCircularProgress } from "react-native-circular-progress";
import API from "../services/api";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const COLORS = {
  primaryBlue: "#1E56A0",
  textDark: "#2D4B7A",
  textGray: "#718096",
  bgGray: "#F8FAFF",
};

export default function ReporteAlumno() {
  const { id, nombre, apellido, grado, dni, correo } = useLocalSearchParams();
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

  /* ---------------- FLASHCARDS ---------------- */

  const flashcardSets = actividades.filter((a) => a.tipo === "flashcard");

  const totalFlashcards = flashcardSets.reduce((total, set) => {
    if (Array.isArray(set.flashcards)) {
      return total + set.flashcards.length;
    }
    return total;
  }, 0);

  /* ---------------- MAPAS ---------------- */

  const mapas = actividades.filter((a) => a.tipo === "mapa-mental");

  /* ---------------- METAS ---------------- */

  const flashGoal = 10;
  const mapaGoal = 2;

  const flashProgress = Math.min(totalFlashcards / flashGoal, 1);
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

  /* ---------------- PDF ---------------- */

  const generarPDF = async () => {
    const fecha = new Date();

    const html = `
<html>
<head>
<style>

body{
font-family: Arial;
background:#F2F6FF;
padding:40px;
color:#2D4B7A;
}

.header{
font-size:30px;
font-weight:bold;
color:#1E56A0;
margin-bottom:25px;
border-bottom:3px solid #1E56A0;
padding-bottom:10px;
}

.card{
background:white;
border-radius:15px;
padding:25px;
margin-bottom:25px;
box-shadow:0 4px 12px rgba(0,0,0,0.08);
}

.info-row{
display:flex;
margin-bottom:10px;
}

.info-label{
width:180px;
font-weight:bold;
color:#1E56A0;
}

.stats{
display:flex;
justify-content:space-between;
margin:30px 0;
}

.stat{
background:white;
padding:20px;
border-radius:12px;
width:30%;
text-align:center;
font-weight:bold;
box-shadow:0 4px 10px rgba(0,0,0,0.08);
font-size:22px;
color:#1E56A0;
}

.stat span{
display:block;
font-size:14px;
color:#555;
}

.section{
font-size:20px;
font-weight:bold;
margin-top:30px;
margin-bottom:15px;
color:#1E56A0;
}

.activity{
background:white;
padding:15px;
border-radius:10px;
margin-bottom:10px;
box-shadow:0 2px 6px rgba(0,0,0,0.08);
}

.bar{
width:100%;
height:16px;
background:#E5E7EB;
border-radius:10px;
margin-top:8px;
overflow:hidden;
}

.fill{
height:100%;
background:#1E56A0;
}

.center{
text-align:center;
margin-top:25px;
}

</style>
</head>

<body>

<div class="header">Reporte del Alumno</div>

<div class="card">

<div class="info-row"><div class="info-label">Nombre:</div>${nombre}</div>
<div class="info-row"><div class="info-label">Apellidos:</div>${apellido}</div>
<div class="info-row"><div class="info-label">Correo:</div>${correo}</div>
<div class="info-row"><div class="info-label">Grado:</div>${grado}</div>
<div class="info-row"><div class="info-label">DNI:</div>${dni}</div>
<div class="info-row"><div class="info-label">Fecha:</div>${fecha.toLocaleDateString()}</div>

</div>

<div class="stats">

<div class="stat">
${totalFlashcards}
<span>Flashcards</span>
</div>

<div class="stat">
${mapas.length}
<span>Mapas</span>
</div>

<div class="stat">
${actividades.length}
<span>Total</span>
</div>

</div>

<div class="section">Flashcards</div>

${flashcardSets
  .map(
    (a) => `
<div class="activity">
<b>${a.titulo}</b><br/>
Tarjetas: ${a.flashcards?.length || 0}<br/>
${new Date(a.createdAt).toLocaleDateString()}
</div>
`,
  )
  .join("")}

<div class="section">Mapas Mentales</div>

${mapas
  .map(
    (a) => `
<div class="activity">
<b>${a.titulo}</b><br/>
${new Date(a.createdAt).toLocaleDateString()}
</div>
`,
  )
  .join("")}

<div class="section">Progreso</div>

<div class="activity">
Flashcards (${Math.round(flashProgress * 100)}%)
<div class="bar">
<div class="fill" style="width:${Math.round(flashProgress * 100)}%"></div>
</div>
</div>

<div class="activity">
Mapas Mentales (${Math.round(mapaProgress * 100)}%)
<div class="bar">
<div class="fill" style="width:${Math.round(mapaProgress * 100)}%"></div>
</div>
</div>

<div class="activity">
Progreso General (${porcentajeGeneral}%)
<div class="bar">
<div class="fill" style="width:${porcentajeGeneral}%"></div>
</div>
</div>

<div class="center">
<b>Avance total: ${porcentajeGeneral}% ${getEmoji(generalProgress)}</b>
<p>${obtenerSugerencia(porcentajeGeneral)}</p>
</div>

</body>
</html>
`;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Reporte del Alumno</Text>
        </View>

        <View style={styles.studentCard}>
          <Text style={styles.studentName}>
            {nombre} {apellido}
          </Text>
          <Text style={styles.studentInfo}>DNI: {dni}</Text>
          <Text style={styles.studentInfo}>Grado: {grado}</Text>
          <Text style={styles.studentInfo}>{correo}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Stat
            icon="cards-outline"
            value={totalFlashcards}
            label="Flashcards"
          />
          <Stat icon="graph-outline" value={mapas.length} label="Mapas" />
          <Stat
            icon="analytics-outline"
            value={actividades.length}
            label="Total"
          />
        </View>

        <Text style={styles.section}>Flashcards</Text>

        {flashcardSets.map((item) => (
          <ItemCard
            key={item._id}
            icon="cards-outline"
            title={item.titulo}
            subtitle={`Tarjetas: ${item.flashcards?.length || 0}`}
            date={item.createdAt}
          />
        ))}

        <Text style={styles.section}>Mapas Mentales</Text>

        {mapas.map((item) => (
          <ItemCard
            key={item._id}
            icon="graph-outline"
            title={item.titulo}
            date={item.createdAt}
          />
        ))}

        <Text style={styles.section}>Progreso</Text>

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

        <TouchableOpacity style={styles.reportBtn} onPress={generarPDF}>
          <Text style={styles.reportText}>Generar reporte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* COMPONENTES */

const Stat = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#1E56A0" />
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ItemCard = ({ icon, title, subtitle, date }) => (
  <View style={styles.card}>
    <MaterialCommunityIcons name={icon} size={22} color="#1E56A0" />
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle && (
        <Text style={{ fontSize: 12, color: "#555" }}>{subtitle}</Text>
      )}
      <Text style={styles.cardDate}>{new Date(date).toLocaleDateString()}</Text>
    </View>
  </View>
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

/* ESTILOS */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFF" },
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#1E56A0",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  title: { color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 15 },
  studentCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  studentName: { fontSize: 18, fontWeight: "bold", color: "#2D4B7A" },
  studentInfo: { color: "#718096", marginTop: 4 },
  statsContainer: { flexDirection: "row", justifyContent: "space-around" },
  statCard: {
    backgroundColor: "white",
    width: 110,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
  },
  statNumber: { fontSize: 20, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#718096" },
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
  cardTitle: { fontWeight: "bold", color: "#2D4B7A" },
  cardDate: { fontSize: 12, color: "#718096" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },
  circleContainer: { alignItems: "center" },
  percent: { fontSize: 16, fontWeight: "bold" },
  circleLabel: { marginTop: 6 },
  progressText: { textAlign: "center", marginTop: 20, fontWeight: "bold" },
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
  reportText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
