import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function EnfoqueHabitos() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enfoque de Hábitos Personales</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌅 Rutina matutina</Text>
        <Text style={styles.cardDesc}>
          Incluye agua, aseo, cama, desayuno y un objetivo diario.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💧 Hidratación</Text>
        <Text style={styles.cardDesc}>
          Lleva un control de vasos de agua consumidos al día.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏃 Ejercicio ligero</Text>
        <Text style={styles.cardDesc}>
          Camina 10–15 minutos o realiza movilidad básica.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f7f7f7" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6A5AE0",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDesc: { fontSize: 14, marginTop: 6 },
});
