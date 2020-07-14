import * as React from 'react';

export const useForceRender = () => React.useReducer((s: boolean) => !s, false)[1] as () => void;
