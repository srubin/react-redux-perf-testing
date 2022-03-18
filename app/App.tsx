import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// @ts-ignore
import appStyles from '../styles/App.module.css';
import {useAppDispatch, useAppSelector} from "./hooks";
import {increment, selectCount} from "./features/counter/counterSlice";
// @ts-ignore
import styles from "../styles/Counter.module.css";
import {connect} from "react-redux";
import {RootState} from "./store";
import {selectFoo} from "./features/extra/extraSlice";
import Image from 'next/image';

interface EmptyProps {

}

const Foo = React.memo(function Foo({value, name}: {value: string, name: string}) {
    return (
        <div className={styles.row}>
            <span>{name}: {value}</span>
        </div>
    );
});

const ExtraConnected = connect((state: RootState) => {
    return {
        foo: selectFoo(state),
    };
})(function ExtraConnected<EmptyProps>({ foo }: { foo: string }) {
    return <Foo value={foo} name="connect" />;
})

function ExtraUseSelector() {
    const foo = useAppSelector(selectFoo);
    return <Foo value={foo} name="useSelector" />;
}

function CounterTick({ms, clearFrameRateTwiddle} :{ ms: number, clearFrameRateTwiddle: number}) {
    const dispatch = useAppDispatch();
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const start = Date.now();
        let ticks = 0;
        const handle = setInterval(() => {
            dispatch(increment());
            ticks++;
            const now = Date.now();
            const fps = ticks / (now - start) * 1000;
            if (ref.current) {
                // modify this directly in the DOM to avoid any impact it may have on react perf
                ref.current.innerText = fps.toFixed(0)
            }
        }, ms)
        return () => {
            clearInterval(handle);
        }
    }, [dispatch, ms, clearFrameRateTwiddle]);

    return (
        <div className={styles.value}>FPS: <span ref={ref} /></div>
    )
}

const Counter = connect((state: RootState) => ({
    count: selectCount(state),
}))(function Counter<EmptyProps>({ count }: { count: number }) {
    // update to reset frame rate computation
    const [clearFrameRateTwiddle, setClearFrameRateTwiddle] = useState(0);

    // useCounterTick(16, clearFrameRateTwiddle);

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
                <span className={styles.value}>Tick: {count}</span>
            </div>
            <div className={styles.row}>
                <CounterTick ms={16} clearFrameRateTwiddle={clearFrameRateTwiddle}/>
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

function Description() {
    return (
        <div className={appStyles.description}>
            <p>
                This demo shows the performance difference between using react-redux's <code>useSelector</code> hook
                and react-redux's <code>connect</code> higher-order component. Each of the components below the big counting
                number are getting a value from redux. They are also all children of the updating counter,
            </p>
            <p>
                Use the toggle to switch the components between the two.
            </p>
            <p>
                You can also change the number of components that are rendered to see the perf impact.
            </p>
            <p>
                FPS is a very coarse measure of performance, here. To get a better sense of what's going on, open
                up the browser dev tools and record a performance profile. With 1000 components, <code>useSelector</code>
                spends 14% of the total time in "scripting" while <code>connect</code> uses 7% of the total time in "scripting":
            </p>
            <p>
                <div>
                    <b>useSelector (1000):</b>
                    <div><Image src="/images/useSelector-1000.png" height={200} width={325} /></div>
                </div>
                <div>
                    <b>Connect (1000):</b>
                    <div><Image src="/images/connect-1000.png" height={200} width={325} /></div>
                </div>
            </p>
            <p>
                With 5000 components, the frame rate drops of <code>useSelector</code> and saturates the UI thread,
                while <code>connect</code> still has capacity to spare:
            </p>
            <p>
                <div>
                    <b>useSelector (5000):</b>
                    <div><Image src="/images/useSelector-5000.png" height={200} width={325} /></div>
                </div>
                <div>
                    <b>Connect (5000):</b>
                    <div><Image src="/images/connect-5000.png" height={200} width={325} /></div>
                </div>
            </p>
            <p>
                <em>
                    <strong>Disclaimer:</strong> You can avoid the penalty altogether by
                    moving the <code>useSelect</code>/<code>connect</code> components outside of
                    the subtree that's re-rendering. (Or, by fetching the value from redux a single
                    time, rather than in each component). This demo should be seen as a proxy for
                    a complex app where a change in the redux store causes a parent with many
                    children to re-render.
                </em>
            </p>
            <p>
                <em>&mdash; Steve Rubin, 3/18/2022</em>
            </p>
        </div>
    )
}

function App() {
  return (
    <div className={appStyles.App}>
        <div className={appStyles.column}>
            <header className={appStyles['App-header']}>
                useSelector considered harmful?
            </header>
            <Description />
        </div>
        <div className={appStyles.column}>
            <Counter />
        </div>
    </div>
  );
}

export default App;
