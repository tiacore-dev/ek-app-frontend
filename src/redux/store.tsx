import { configureStore } from "@reduxjs/toolkit";
import dataFiltersReducer from "./slices/dataFiltersSlice";
import breadcrumbsReducer from "./slices/breadcrumbsSlice";

export const store = configureStore({
  reducer: {
    breadcrumbs: breadcrumbsReducer,
    datafilters: dataFiltersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
