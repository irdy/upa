import { BehaviorSubject, distinctUntilChanged, skip } from "rxjs";
import { useEffect, useState } from "react";
import { isEqual } from "lodash";

/**
 * Hook, reflect data from Data Source wrapped by Observable to React State
 * @param subject - RxJS Subject, for observe data changes
 */
export function useObservable<T,>(subject: BehaviorSubject<T>): [T | void, any] {
  const [value, setValue] = useState<T | void>(subject.getValue());
  const [error, setError] = useState();

  useEffect(() => {
    const observable = subject.asObservable()
      .pipe(
        // skip first value, because we already set current value of BehaviourSubject in start of hook
        skip(1),
        distinctUntilChanged((prev, current) => isEqual(prev, current))
      )
      .subscribe({
        next: (val: T) => {
          if (val === undefined) throw Error("use null instead of undefined");
          setValue(val);
        },
        error: setError, // subject ends here, how to handle it better?
        complete: () => console.log("COMPLETED")
      });

    return () => {
      observable.unsubscribe();
    }

  }, [subject]);

  return [value, error];
}

