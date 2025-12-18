import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";

export default function MapaMentalGrafico({ titulo, nodos }) {
  const [layout, setLayout] = useState(null);

  if (!layout) {
    return (
      <View
        style={styles.container}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
      />
    );
  }

  const { width, height } = layout;

  const centroX = width / 2;
  const centroY = height / 2;

  // Factor para alargar las líneas
  const factor = 1.3;
  const radio = (Math.min(width, height) / 3) * factor;

  const nodosPos = nodos.map((nodo, i) => {
    const angle = (2 * Math.PI * i) / nodos.length;
    return {
      ...nodo,
      x: centroX + Math.cos(angle) * radio,
      y: centroY + Math.sin(angle) * radio,
    };
  });

  return (
    <View style={styles.container}>
      {/* LÍNEAS */}
      <Svg style={StyleSheet.absoluteFill}>
        {nodosPos.map((nodo, i) => (
          <Line
            key={i}
            x1={centroX}
            y1={centroY}
            x2={nodo.x}
            y2={nodo.y}
            stroke="#4A70A9"
            strokeWidth={2}
          />
        ))}
      </Svg>

      {/* NODO CENTRAL */}
      <View style={[styles.central, { left: centroX - 60, top: centroY - 30 }]}>
        <Text style={styles.centralText}>{titulo}</Text>
      </View>

      {/* NODOS */}
      {nodosPos.map((nodo, i) => (
        <View
          key={i}
          style={[styles.nodo, { left: nodo.x - 70, top: nodo.y - 40 }]}
        >
          <Text style={styles.nodoTitle}>{nodo.titulo}</Text>
          <Text style={styles.nodoDesc}>{nodo.descripcion}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  central: {
    position: "absolute",
    width: 120,
    padding: 10,
    backgroundColor: "#4A70A9",
    borderRadius: 30,
    alignItems: "center",
  },

  centralText: {
    color: "#EFECE3",
    fontWeight: "bold",
    textAlign: "center",
  },

  nodo: {
    position: "absolute",
    width: 140,
    backgroundColor: "#EFECE3",
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4A70A9",
  },

  nodoTitle: {
    fontWeight: "bold",
    color: "#4A70A9",
  },

  nodoDesc: {
    fontSize: 12,
  },
});
