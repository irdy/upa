import React from "react";

export function useRequest<T>(loader: () => Promise<T>) {
  const [state, setState] = React.useState<T | null>(null);

  React.useEffect(() => {
    (async function () {
      try {
        const data = await loader();
        setState(data);
      } catch (err) {
        throw err;
      }
    })();
  }, []);

  return [state, setState];
}

