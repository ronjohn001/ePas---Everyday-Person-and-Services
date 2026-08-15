import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/hooks/auth-store";
import { CatalogProvider } from "@/hooks/catalog-store";
import { AdProvider } from "@/hooks/ad-store";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import { ScreenBackground } from "@/components/ScreenBackground";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();

  // Use a redirect-based approach instead of conditional Stack.Screen rendering.
  // This prevents the entire navigator from remounting on auth state changes.
  useEffect(() => {
    if (isLoading) return;
    const root = segments[0] as string | undefined;

    if (!isAuthenticated) {
      if (root !== "login") router.replace("/login");
      return;
    }

    // Account-approval gate: non-admin users must be approved by an admin first.
    const needsApproval = !!user && user.role !== "ADMIN" && user.approvalStatus !== "APPROVED";
    if (needsApproval) {
      if (user.role === "PROVIDER") {
        // Traders can reach onboarding (to submit their profile) and the status screen.
        if (root !== "provider" && root !== "pending-approval") router.replace("/provider/onboarding");
      } else if (root !== "pending-approval") {
        router.replace("/pending-approval");
      }
      return;
    }

    if (!root || root === "login" || root === "pending-approval") {
      // Land each role on its own home tab instead of relying on the navigator's initial route.
      const home =
        user?.role === "ADMIN"
          ? "/(tabs)/admin-overview"
          : user?.role === "PROVIDER"
            ? "/(tabs)/provider-dashboard"
            : "/(tabs)";
      router.replace(home);
    }
  }, [isAuthenticated, isLoading, user, segments]);

  if (isLoading) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back", headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="pending-approval" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Client detail screens */}
      <Stack.Screen name="category/[categoryId]" options={{ headerShown: false }} />
      <Stack.Screen name="provider/[providerId]" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[bookingId]" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[bookingId]/chat" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[bookingId]/review" options={{ headerShown: false }} />
      <Stack.Screen name="booking/create" options={{ headerShown: false }} />
      <Stack.Screen name="service-job/[serviceJobId]" options={{ headerShown: false }} />
      <Stack.Screen name="loyalty" options={{ headerShown: false }} />
      <Stack.Screen name="calendar" options={{ headerShown: false }} />
      <Stack.Screen name="my-reviews" options={{ headerShown: false }} />
      <Stack.Screen name="favourites" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="provider-suggestion" options={{ headerShown: false }} />
      <Stack.Screen name="subscriptions" options={{ headerShown: false }} />
      <Stack.Screen name="transactions" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      {/* Admin detail screens (pushed from the admin dashboard) */}
      <Stack.Screen name="admin/catalog" options={{ headerShown: false }} />
      <Stack.Screen name="admin/revenue" options={{ headerShown: false }} />
      <Stack.Screen name="admin/adverts" options={{ headerShown: false }} />
      <Stack.Screen name="admin/reviews" options={{ headerShown: false }} />
      <Stack.Screen name="admin/traders" options={{ headerShown: false }} />
      <Stack.Screen name="admin/users" options={{ headerShown: false }} />
      <Stack.Screen name="provider/onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayoutNav() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <AdProvider>
          <AuthenticatedApp />
        </AdProvider>
      </CatalogProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(0,255,163,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,163,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
