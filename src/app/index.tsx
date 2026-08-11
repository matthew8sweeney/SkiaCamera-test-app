import { PaintStyle, Skia, useFont } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { SkiaCamera, SkiaCameraProps } from "react-native-vision-camera-skia";

export default function Index() {
  const cameraDevice = useCameraDevice("back");
  const font = useFont(require("@/assets/fonts/FiraMono-Regular.ttf"), 40);
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);
  const [hideSkiaCamera, setHideSkiaCamera] = useState(true);

  const handleFrame: SkiaCameraProps["onFrame"] = (frame, render) => {
    "worklet";
    render(({ frameTexture, canvas }) => {
      // Draw the camera image onto the preview view
      canvas.drawImage(frameTexture, 0, 0);

      // Draw lines going from the center to the 4 corners
      const paint = Skia.Paint();
      paint.setStyle(PaintStyle.Stroke);
      paint.setStrokeWidth(10);

      const center = { x: frame.width / 2, y: frame.height / 2 };
      function drawText(str: string, x: number, y: number) {
        if (!font) return;
        const prevWidth = paint.getStrokeWidth();
        paint.setStrokeWidth(4);
        canvas.drawText(str, x, y, paint, font);
        paint.setStrokeWidth(prevWidth);
      }

      paint.setColor(Skia.Color("#FF0"));
      canvas.drawLine(center.x, center.y, 0, 0, paint);
      drawText("(0, 0)", center.x - 150, center.y - 100);

      paint.setColor(Skia.Color("#0FF"));
      canvas.drawLine(center.x, center.y, frame.width, 0, paint);
      drawText(`(${frame.width}, 0)`, center.x + 300, center.y - 100);

      paint.setColor(Skia.Color("#F0F"));
      canvas.drawLine(center.x, center.y, frame.width, frame.height, paint);
      drawText(`(${frame.width}, ${frame.height})`, center.x + 200, center.y + 100);

      paint.setColor(Skia.Color("#0F0"));
      canvas.drawLine(center.x, center.y, 0, frame.height, paint);
      drawText(`(0, ${frame.height})`, center.x - 300, center.y + 50);
    });
    frame.dispose();
  };

  let cameraContent = null;
  if (!hasPermission) {
    cameraContent = (
      <View style={styles.container}>
        <Text style={{ marginBottom: 10 }}>Camera permission is not granted</Text>
        <TouchableOpacity style={styles.button} onPress={() => Linking.openSettings()}>
          <Text>Open settings app</Text>
        </TouchableOpacity>
      </View>
    );
  }
  else if (!cameraDevice) {
    cameraContent = (
      <View style={styles.container}>
        <Text>No camera found</Text>
      </View>
    );
  }
  else {
    if (hideSkiaCamera) {
      cameraContent = (
        <View style={styles.container}>
          <Text>SkiaCamera is not being rendered</Text>
        </View>
      );
    }
    else {
      cameraContent = (
        <SkiaCamera
          style={styles.camera}
          device={cameraDevice}
          isActive={true}
          onFrame={handleFrame}
          pixelFormat="yuv"
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      {cameraContent}
      <View style={styles.bottomView}>
        <TouchableOpacity style={styles.button} onPress={() => setHideSkiaCamera(val => !val)}>
          <Text>Toggle SkiaCamera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  button: {
    width: 200,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    backgroundColor: "lightgray",
  },
  bottomView: {
    position: "absolute",
    bottom: 20,
    right: 20,
    justifyContent: "center",
  },
});
