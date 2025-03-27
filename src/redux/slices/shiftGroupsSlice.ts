import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GroupState {
  activeCity: string | null;
  activeGroups: {
    [city: string]: string | null;
  };
}

interface ShiftGroupsState {
  [shiftId: string]: GroupState;
}

const initialState: ShiftGroupsState = {};

export const shiftGroupsSlice = createSlice({
  name: "shiftGroups",
  initialState,
  reducers: {
    setActiveCity: (
      state,
      action: PayloadAction<{ shiftId: string; city: string | null }>
    ) => {
      const { shiftId, city } = action.payload;
      if (!state[shiftId]) {
        state[shiftId] = { activeCity: null, activeGroups: {} };
      }
      state[shiftId].activeCity = city;
    },
    setActiveGroup: (
      state,
      action: PayloadAction<{
        shiftId: string;
        city: string;
        groupType: string | null;
      }>
    ) => {
      const { shiftId, city, groupType } = action.payload;
      if (!state[shiftId]) {
        state[shiftId] = { activeCity: null, activeGroups: {} };
      }
      state[shiftId].activeGroups[city] = groupType;
    },
  },
});

export const { setActiveCity, setActiveGroup } = shiftGroupsSlice.actions;

export default shiftGroupsSlice.reducer;
