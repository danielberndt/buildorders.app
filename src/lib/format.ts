const pad = (pad: string, str: string | number) => {
  return (pad + str).slice(-pad.length);
};

const pad2 = (str: string | number) => ("00" + str).slice(-pad.length);

export const formatTime = (val: number) => `${pad2(Math.floor(val / 60))}:${pad2(val % 60)}`;
