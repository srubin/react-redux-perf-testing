import React, {useCallback, useEffect, useMemo, useState} from 'react';
// @ts-ignore
import appStyles from '../styles/App.module.css';
import {useAppDispatch, useAppSelector} from "./hooks";
import {increment, selectCount} from "./features/counter/counterSlice";
// @ts-ignore
import styles from "../styles/Counter.module.css";
import {connect} from "react-redux";
import {RootState} from "./store";
import {selectFoo} from "./features/extra/extraSlice";

interface EmptyProps {

}

const ExtraConnected = connect((state: RootState) => {
    return {
        foo: selectFoo(state),
    };
})(function ExtraConnected<EmptyProps>({ foo }: { foo: string }) {
    return (
        <div className={styles.row}>
            <span>Connect: {foo}</span>
        </div>
    );
})

function ExtraUseSelector() {
    const foo = useAppSelector(selectFoo);
    return (
        <div className={styles.row}>
            <span>Use selector: {foo}</span>
        </div>
    );
}

function useCounterTick(ms: number, clearFrameRateTwiddle: number) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const start = Date.now();
        let ticks = 0;
        const handle = setInterval(() => {
            dispatch(increment());
            ticks++;
            const now = Date.now();
            console.log('Frame rate', ticks / (now - start) * 1000)
        }, ms)
        return () => {
            clearInterval(handle);
        }
    }, [dispatch, ms, clearFrameRateTwiddle]);
}

const Counter = connect((state: RootState) => ({
    count: selectCount(state),
}))(function Counter<EmptyProps>({ count }: { count: number }) {
    // update to reset frame rate computation
    const [clearFrameRateTwiddle, setClearFrameRateTwiddle] = useState(0);

    useCounterTick(16, clearFrameRateTwiddle);

    const [componentCount, setComponentCount] = useState<number | undefined>(1000);
    const arr = useMemo(() => {
        return new Array(componentCount).fill(0);
    }, [componentCount])
    const changeCount = useCallback((event) => {
        try {
            let count = parseInt(event.target.value, 10);
            if (isNaN(count)) {
                setComponentCount(undefined)
            } else {
                setComponentCount(count);
            }
        } catch (err) {
            console.error(err);
            setComponentCount(undefined);
        }
        setClearFrameRateTwiddle((x) => x + 1);
    }, []);

    const [extraType, setExtraType] = useState('useSelector');
    const toggle = useCallback(() => {
        setExtraType((et) => et === 'useSelector' ? 'connect' : 'useSelector')
        setClearFrameRateTwiddle((x) => x + 1)
    }, [])

    return (
        <div>
            <div className={styles.row}>
                <span className={styles.value}>{count}</span>
            </div>
            <div className={styles.row}>
                <button onClick={toggle}>Toggle component type</button>
            </div>
            <div className={styles.row}>
                Component count: <input value={componentCount} onChange={changeCount} />
            </div>
            {arr.map((_, i) => {
                if (extraType === 'useSelector') {
                    return <ExtraUseSelector key={i} />
                }
                return <ExtraConnected key={i} />
            })}
        </div>
    );
});

function App() {
  return (
    <div className={appStyles.App}>
      <header className={appStyles['App-header']}>
        <Counter />
      </header>
    </div>
  );
}

export default App;
