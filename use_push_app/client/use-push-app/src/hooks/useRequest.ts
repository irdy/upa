import React from "react";

// todo та же самая проблема, лоадер в зависимостях, нужна ссылка...
export function useRequest<T>(loader: () => Promise<T>) {
  const [state, setState] = React.useState<T | null>(null);

  React.useEffect(() => {
    (async function () {
      setState(await loader());
    })();
  }, [loader]);

  return [state, setState];
}

