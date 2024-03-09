'use client';

import { open } from '@tauri-apps/api/dialog';
import { emit, listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/window';
import { useEffect, useRef } from 'react';
import type { UnlistenFn } from '@tauri-apps/api/helpers/event';

export const Other = () => {
  const emitMessageInput = useRef<HTMLInputElement>(null);

  const handleClickOpen = () => {
    open().then((files) => console.log(files));
  };

  const handleClickEmitMessage = () => {
    if (!emitMessageInput.current) {
      return;
    }
    emit('front-to-back', emitMessageInput.current.value);
  };

  const handleClickOpenWindow = () => {
    const webview = new WebviewWindow('window');
    webview.emit('front-to-back', 'new window');
  };

  useEffect(() => {
    let unlisten: UnlistenFn;

    async function f() {
      unlisten = await listen('back-to-front', (event) => {
        console.log(`back-to-front ${event.payload} ${new Date()}`);
      });
    }

    f();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return (
    <div>
      <h1>Other</h1>
      <div className={'flex flex-col gap-4'}>
        <div>
          <button onClick={handleClickOpen}>open</button>
        </div>
        <div className={'flex gap-4'}>
          <button onClick={handleClickOpenWindow}>open window</button>
        </div>
        <div className={'flex gap-4'}>
          <input type={'text'} ref={emitMessageInput} />
          <button onClick={handleClickEmitMessage}>emit message</button>
        </div>
      </div>
    </div>
  );
};
