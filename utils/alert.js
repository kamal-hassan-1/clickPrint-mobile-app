//----------------------------------- IMPORTS -----------------------------------//

import { Alert, Platform } from "react-native";

//----------------------------------- ALERT -----------------------------------//

// App-wide alert entry point. Every call site uses `showAlert(title, message,
// buttons)` — matching React Native's Alert.alert signature — so the underlying
// presentation can change without touching them.
//
// The default presentation is a custom themed popup (see components/CustomAlert):
// AlertHost registers an imperative handler here at app startup, and showAlert
// routes to it. If no handler is registered yet (e.g. an alert fires before the
// host mounts, or in a context where it isn't rendered), we fall back to the
// native Alert.alert on iOS/Android and the browser's window.alert /
// window.confirm on web — the same behaviour this shim had previously.

let alertHandler = null;

// Called by AlertHost on mount. Returns an unregister function for cleanup.
export function registerAlertHandler(handler) {
	alertHandler = handler;
	return () => {
		if (alertHandler === handler) alertHandler = null;
	};
}

const joinText = (title, message) => [title, message].filter(Boolean).join("\n\n");

function fallbackAlert(title, message, buttons) {
	if (Platform.OS !== "web") {
		Alert.alert(title, message, buttons);
		return;
	}

	const text = joinText(title, message);

	if (!buttons || buttons.length === 0) {
		window.alert(text);
		return;
	}

	if (buttons.length === 1) {
		window.alert(text);
		buttons[0].onPress?.();
		return;
	}

	// Two or more buttons: treat as a confirm. The cancel-styled button (or the
	// first button) is the dismiss action; the last non-cancel button is confirm.
	const cancelBtn = buttons.find((b) => b.style === "cancel") ?? buttons[0];
	const confirmBtn = [...buttons].reverse().find((b) => b.style !== "cancel") ?? buttons[buttons.length - 1];

	if (window.confirm(text)) {
		confirmBtn?.onPress?.();
	} else {
		cancelBtn?.onPress?.();
	}
}

export function showAlert(title, message, buttons) {
	if (alertHandler) {
		alertHandler({ title, message, buttons });
		return;
	}
	fallbackAlert(title, message, buttons);
}

export default showAlert;
