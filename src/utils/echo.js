// src/utils/echo.js
// import Echo from "laravel-echo";
// import Pusher from "pusher-js";

// window.Pusher = Pusher;

// const echo = new Echo({
//   broadcaster: "reverb",
//   key: import.meta.env.VITE_REVERB_APP_KEY || "reverbkey123",
//   wsHost: import.meta.env.VITE_REVERB_HOST || "localhost",
//   wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
//   wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
//   forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") === "https",
//   enabledTransports: ["ws", "wss"],
// });

// export default echo;

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || "api.rekacer.my.id",
  wsPort: 443,
  wssPort: 443,
  forceTLS: true,
  enabledTransports: ["ws", "wss"],
  
  authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        fetch(`${import.meta.env.VITE_API_URL}/broadcasting/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include", // Mengirim cookie session Sanctum
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Auth failed");
            return response.json();
          })
          .then((data) => callback(false, data))
          .catch((error) => callback(true, error));
      },
    };
  },
});

export default echo;