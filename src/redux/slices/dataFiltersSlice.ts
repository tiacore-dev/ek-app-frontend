import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DataFiltersState {
  shifts: {
    dateFrom?: number;
    dateTo?: number;
  };
}

const initialState: DataFiltersState = {
  shifts: {
    dateFrom: undefined,
    dateTo: undefined,
  },
};

export const dataFiltersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setShiftsDateFilter: (
      state,
      action: PayloadAction<{
        dateFrom?: number;
        dateTo?: number;
      }>
    ) => {
      state.shifts.dateFrom = action.payload.dateFrom;
      state.shifts.dateTo = action.payload.dateTo;
    },
    resetShiftsDateFilter: (state) => {
      state.shifts.dateFrom = undefined;
      state.shifts.dateTo = undefined;
    },
  },
});

export const { setShiftsDateFilter, resetShiftsDateFilter } =
  dataFiltersSlice.actions;
export default dataFiltersSlice.reducer;
