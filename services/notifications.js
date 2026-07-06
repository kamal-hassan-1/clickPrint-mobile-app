import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import config from "../config/config";

const API_BASE_URL = config.apiBaseUrl;

export async function createAndroidNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
}

export async function registerForPushNotifications() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Permission not granted to get push token for push notification!");
        return;
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
        console.log("Project ID not found");
        return;
    }

    try {
        const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("Push token:", pushTokenString);
        return pushTokenString;
    } catch (e) {
        console.log(`Failed to get push token: ${e}`);
    }
}

export async function sendPushTokenToBackend(expoPushToken) {
    if (!expoPushToken) return;

    const authToken = await SecureStore.getItemAsync("authToken");
    if (!authToken) {
        console.log("No auth token found, skipping push token registration");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/notifications/register-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ expoPushToken }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Push token registered with backend:", data);
        return data;
    } catch (e) {
        console.log(`Failed to send push token to backend: ${e}`);
    }
}