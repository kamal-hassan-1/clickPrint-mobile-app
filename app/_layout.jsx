import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/auth";
import { colors } from "../constants/colors";
import WebInstallGate from "../components/WebInstallGate";
import AlertHost from "../components/CustomAlert";

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(colors.background);

// Routes reachable without a completed profile: "/" (login) and "/otp".
function isGuestOnlyRoute(segment) {
  return segment === undefined || segment === "otp";
}

function RootNavigation() {
  const { authState } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  // Only the very first resolved route is auto-corrected below; once settled,
  // in-app navigation (to detail screens, tabs, etc.) is left alone so authed
  // users can freely visit routes outside "(tabs)".
  const [initialRouteReady, setInitialRouteReady] = useState(false);

  const inGuestOnly = isGuestOnlyRoute(segments[0]);
  const inProfileSetup = segments[0] === "profile-setup";

  let redirectTarget = null;
  if (authState === "guest" && !inGuestOnly) redirectTarget = "/";
  else if (authState === "needs-profile" && !inProfileSetup) redirectTarget = "/profile-setup";
  else if (authState === "authed" && (inGuestOnly || inProfileSetup)) redirectTarget = "/(tabs)/home";

  useEffect(() => {
    if (authState === "checking" || initialRouteReady) return;
    if (redirectTarget) {
      router.replace(redirectTarget);
      return;
    }
    setInitialRouteReady(true);
    SplashScreen.hideAsync();
  }, [authState, redirectTarget, initialRouteReady, router]);

  // Keep the splash screen up until the route actually matches the resolved
  // authState, otherwise the wrong screen flashes for a frame while the
  // redirect above is still in flight.
  if (authState === "checking" || !initialRouteReady) return null;
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