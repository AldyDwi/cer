import React from "react";
import ReactDOM from "react-dom/client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "./services/queryClient";
import { queryPersister } from "./services/queryPersister";

import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>
);
