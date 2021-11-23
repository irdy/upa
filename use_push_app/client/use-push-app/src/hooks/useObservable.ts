import { Observable } from "rxjs";
import { useEffect, useState } from "react";

export const useObservable = <T, >(obs: Observable<T>, initialValue?: T) => {
  const [ value, setValue ] = useState<T | void>(initialValue);
  const [ error, setError ] = useState();

  useEffect(() => {
    const subscription = obs.subscribe({
      next: (val: T) => {
        console.log(val);
        setValue(val);
      },
      error: setError,
      // complete ?
    });
    return () => {
      console.log(subscription, "unsubscribed");
      subscription.unsubscribe();
    }

  }, [ obs ]);

  return [ value, error ];
}

