import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/auth";
import { colors } from "../constants/colors";
import WebInstallGate from "../components/WebInstallGate";
import AlertHost from "../components/CustomAlert";

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.background);

function RootNavigation() {
  const { authState } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const inTabs = segments[0] === "(tabs)";
  const needsRedirect =
    authState !== "checking" &&
    ((authState === "guest" && inTabs) || (authState === "authed" && !inTabs));

  useEffect(() => {
    if (authState === "checking") return;
    if (needsRedirect) {
      router.replace(authState === "authed" ? "/(tabs)/home" : "/");
      return;
    }
    SplashScreen.hideAsync();
  }, [authState, needsRedirect, router]);

  // Keep the splash screen up until the route actually matches the resolved
  // authState, otherwise the wrong screen flashes for a frame while the
  // redirect above is still in flight.
  if (authState === "checking" || needsRedirect) return null;
  return <Slot />;
}

export default function RootLayout() {
  return (
    <WebInstallGate>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
      <AlertHost />
    </WebInstallGate>
  );
}