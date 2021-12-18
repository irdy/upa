import { BehaviorSubject, distinctUntilChanged, Subject } from "rxjs";
import { useEffect, useState } from "react";
import { isEqual } from "lodash";

/**
 * Hook, reflect data from Data Source wrapped by Observable to React State
 * @param subject - RxJS Subject, for observe data changes
 */
export function useObservable<T,>(subject: Subject<T>): [T | void, any, boolean];
export function useObservable<T,>(subject: BehaviorSubject<T>): [T | void, any, boolean];

export function useObservable<T,>(subject: Subject<T> | BehaviorSubject<T>): [T | void, any, boolean] {
  const [value, setValue] = useState<T | void>();
  const [error, setError] = useState();

  useEffect(() => {
    const observable = subject.asObservable()
      .pipe(
        distinctUntilChanged((prev, current) => isEqual(prev, current))
      )
      .subscribe({
        next: (val: T) => {
          // if (val === undefined) throw Error("use null instead of undefined") ??
          console.log("OBSERVABLE VALUE", val);
          setValue(val);
        },
        error: setError, // subject ends here, how to handle it better?
        complete: () => console.log("COMPLETED")
      });

    return () => {
      observable.unsubscribe();
    }

  }, [subject]);

  /* data loaded */
  const subjectInitialized = subject instanceof BehaviorSubject && subject.getValue() !== undefined;

  return [value, error, subjectInitialized];
}

