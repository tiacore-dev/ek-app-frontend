import { configureStore } from "@reduxjs/toolkit";
import dataFiltersReducer from "./slices/dataFiltersSlice";
import breadcrumbsReducer from "./slices/breadcrumbsSlice";
import shiftGroupsReducer from "./slices/shiftGroupsSlice";

export const store = configureStore({
  reducer: {
    breadcrumbs: breadcrumbsReducer,
    datafilters: dataFiltersReducer,
    shiftGroups: shiftGroupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
