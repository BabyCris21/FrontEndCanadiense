import { useRef } from "react";
import {
  Animated,
  Dimensions,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MapaMentalZoom({ children, onClose }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 0.7;
  const MAX_SCALE = 3;
  const MAX_TRANSLATE_X = SCREEN_WIDTH / 2;
  const MAX_TRANSLATE_Y = SCREEN_HEIGHT / 2;

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: false,
  });

  const onPinchStateChange = (event) => {
    if (
      event.nativeEvent.oldState === State.ACTIVE ||
      event.nativeEvent.state === State.END
    ) {
      let newScale = lastScale.current * event.nativeEvent.scale;
      newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      lastScale.current = newScale;
      scale.setValue(newScale);
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onPanStateChange = (event) => {
    if (
      event.nativeEvent.oldState === State.ACTIVE ||
      event.nativeEvent.state === State.END
    ) {
      let newX = lastTranslate.current.x + event.nativeEvent.translationX;
      let newY = lastTranslate.current.y + event.nativeEvent.translationY;

      newX = Math.min(Math.max(newX, -MAX_TRANSLATE_X), MAX_TRANSLATE_X);
      newY = Math.min(Math.max(newY, -MAX_TRANSLATE_Y), MAX_TRANSLATE_Y);

      lastTranslate.current = { x: newX, y: newY };
      translateX.setValue(newX);
      translateY.setValue(newY);
    }
  };

  const centrarMapa = () => {
    lastTranslate.current = { x: 0, y: 0 };
    lastScale.current = 1;
    translateX.setValue(0);
    translateY.setValue(0);
    scale.setValue(1);
  };

  return (
    <View style={styles.modalBackground}>
      {/* Fondo uniforme */}
      <View style={styles.background} />

      {/* Contenido con zoom */}
      <PanGestureHandler
        onGestureEvent={onPanEvent}
        onHandlerStateChange={onPanStateChange}
      >
        <Animated.View
          style={[
            styles.wrapper,
            { transform: [{ translateX }, { translateY }, { scale }] },
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

      {/* Botón de centrar abajo a la izquierda */}
      <TouchableOpacity style={styles.centerBtn} onPress={centrarMapa}>
        <Text style={styles.buttonText}>🧭 Centrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: { flex: 1 },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#EFECE3", // crema paleta
  },
  wrapper: { flex: 1 },

  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#A70A90", // paleta
    padding: 12,
    borderRadius: 10,
    zIndex: 10,
  },
  centerBtn: {
    position: "absolute",
    bottom: 40,
    left: 20,
    backgroundColor: "#8FABD4", // paleta
    padding: 12,
    borderRadius: 10,
    zIndex: 10,
  },
  buttonText: {
    color: "#EFECE3", // contraste con los botones
    fontWeight: "bold",
  },
});
