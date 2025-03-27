import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface DataFiltersState {
  shifts: {
    dateFrom?: number;
    dateTo?: number;
    currentPage: number;
    pageSize: number;
  };
}

const initialState: DataFiltersState = {
  shifts: {
    dateFrom: undefined,
    dateTo: undefined,
    currentPage: 1,
    pageSize: 10,
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
    setShiftsPagination: (
      state,
      action: PayloadAction<{ currentPage: number; pageSize: number }>
    ) => {
      state.shifts.currentPage = action.payload.currentPage;
      state.shifts.pageSize = action.payload.pageSize;
    },
  },
});

export const {
  setShiftsDateFilter,
  resetShiftsDateFilter,
  setShiftsPagination,
} = dataFiltersSlice.actions;
export default dataFiltersSlice.reducer;
