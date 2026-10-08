import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { localStorageAsync } from "./storage";

export const queryPersister = createAsyncStoragePersister({
    storage: localStorageAsync,
    key: "reka-cer-query-cache",
  });