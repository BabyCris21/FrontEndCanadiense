import { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";

const COLORS = {
  primaryBlue: "#1E56A0",
  white: "#FFFFFF",
  bgGray: "#F8FAFF",
};

export default function MapaMentalZoom({ children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });

  // --- FUNCIÓN QUE FALTABA O ESTABA MAL DEFINIDA ---
  const centrarMapa = () => {
    // Resetear valores de animación a 0 y escala a 1
    Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
    Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
    Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();

    // Resetear los estados de referencia
    lastScale.current = 1;
    lastTranslate.current = { x: 0, y: 0 };

    // Limpiar offsets para que no salte al volver a tocar
    translateX.setOffset(0);
    translateY.setOffset(0);
  };

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: false,
  });

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      lastScale.current = Math.max(0.7, Math.min(3, lastScale.current));
      scale.setValue(lastScale.current);
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: false },
  );

  const onPanStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastTranslate.current.x += event.nativeEvent.translationX;
      lastTranslate.current.y += event.nativeEvent.translationY;
      translateX.setOffset(lastTranslate.current.x);
      translateY.setOffset(lastTranslate.current.y);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanStateChange}
      >
        <Animated.View
          style={[
            styles.wrapper,
            { transform: [{ scale }, { translateX }, { translateY }] },
          ]}
        >
          <PinchGestureHandler
            onGestureEvent={onPinchEvent}
            onHandlerStateChange={onPinchStateChange}
          >
            <Animated.View style={styles.wrapper}>{children}</Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.centerBtn}
        onPress={centrarMapa}
      >
        <Text style={styles.btnText}>🎯 RE-ENFOCAR MAPA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgGray },
  wrapper: { flex: 1 },
  centerBtn: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1.5,
  },
});
