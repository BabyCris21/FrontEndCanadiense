import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const NODE_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#A29BFE",
  "#FDCB6E",
  "#6C5CE7",
  "#78E08F",
  "#E15F41",
];

export default function MapaMentalGrafico({ titulo, nodos }) {
  const [layout, setLayout] = useState(null);

  if (!layout)
    return (
      <View
        style={styles.container}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
      />
    );

  const { width, height } = layout;
  const centroX = width / 2;
  const centroY = height / 2;

  // Radio más amplio para que los nodos no estén pegados al centro
  const radioX = width * 0.38;
  const radioY = height * 0.35;

  const nodosPos = nodos.map((nodo, i) => {
    const angle = (2 * Math.PI * i) / nodos.length;
    return {
      ...nodo,
      x: centroX + Math.cos(angle) * radioX,
      y: centroY + Math.sin(angle) * radioY,
      color: NODE_COLORS[i % NODE_COLORS.length],
    };
  });

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill}>
        {nodosPos.map((nodo, i) => (
          <Path
            key={i}
            d={`M${centroX} ${centroY} Q ${centroX} ${nodo.y}, ${nodo.x} ${nodo.y}`}
            stroke={nodo.color}
            strokeWidth={4} // Línea más gruesa para que se vea en la descarga
            fill="none"
            opacity={0.8}
          />
        ))}
      </Svg>

      {/* TEMA CENTRAL MÁS GRANDE */}
      <View
        style={[styles.central, { left: centroX - 110, top: centroY - 55 }]}
      >
        <Text style={styles.centralLabel}>TEMA PRINCIPAL</Text>
        <Text style={styles.centralText}>{titulo}</Text>
      </View>

      {/* NODOS CON TEXTO MÁS GRANDE */}
      {nodosPos.map((nodo, i) => (
        <View
          key={i}
          style={[
            styles.nodo,
            { left: nodo.x - 110, top: nodo.y - 50, borderColor: nodo.color },
          ]}
        >
          <View style={[styles.nodoHeader, { backgroundColor: nodo.color }]}>
            <Text style={styles.nodoTitle}>{nodo.titulo || "Subtema"}</Text>
          </View>
          <View style={styles.nodoBody}>
            <Text style={styles.nodoDesc}>{nodo.descripcion}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    width: "100%",
    height: "100%",
  },
  central: {
    position: "absolute",
    width: 220,
    height: 110,
    backgroundColor: "#1E56A0",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
    borderWidth: 4,
    borderColor: "#FFF",
    zIndex: 10,
  },
  centralLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  centralText: {
    color: "#FFF",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 20,
    paddingHorizontal: 10,
  },
  nodo: {
    position: "absolute",
    width: 220,
    backgroundColor: "#FFF",
    borderRadius: 15,
    elevation: 8,
    borderWidth: 3,
    overflow: "hidden",
  },
  nodoHeader: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  nodoTitle: {
    fontWeight: "bold",
    color: "#FFF",
    fontSize: 15,
    textTransform: "uppercase",
  },
  nodoBody: { padding: 12, backgroundColor: "#FFF" },
  nodoDesc: {
    fontSize: 13,
    color: "#2D3748",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },
});
