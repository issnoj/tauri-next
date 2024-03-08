'use client';

import { open } from '@tauri-apps/api/dialog';

export const Other = () => {
  const handleClickOpen = () => {
    open().then((files) => console.log(files));
  };

  return (
    <div>
      <h1>Other</h1>
      <button onClick={handleClickOpen}>open</button>
    </div>
  );
};
