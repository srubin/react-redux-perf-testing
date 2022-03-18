import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../store';

export interface ExtraState {
    foo: string;
}

const initialState: ExtraState = {
    foo: 'bar'
};

export const extraSlice = createSlice({
    name: 'extra',
    initialState,
    reducers: {
        // nada
    },
});

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectFoo = (state: RootState) => state.extra.foo;

export default extraSlice.reducer;
