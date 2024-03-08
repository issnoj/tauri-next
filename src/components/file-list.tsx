'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { cn } from '@/lib/utils';
import { CornerLeftUp } from 'lucide-react';

type File = {
  name: string;
  path: string;
  is_dir: boolean;
};

export default function FileList() {
  const [error, setError] = useState('');
  const [entries, setEntries] = useState<File[]>([]);
  const dirPathInput = useRef<HTMLInputElement>(null);
  const [currentPath, setCurrentPath] = useState('');
  const parentDir =
    currentPath !== '/'
      ? currentPath.substring(0, currentPath.lastIndexOf('/')) || '/'
      : null;

  const getEntries = useCallback((path: string) => {
    setError('');
    invoke<File[]>('get_entries', { path })
      .then((result) => {
        setEntries(result);
        setCurrentPath(path);
      })
      .catch((error) => {
        setError(error);
      });
  }, []);

  const handleClickPath = (file: File) => {
    if (file.is_dir) {
      getEntries(file.path);
    }
  };

  const handleClick = () => {
    if (!dirPathInput.current || !dirPathInput.current.value) {
      return;
    }
    getEntries(dirPathInput.current.value);
  };

  const handleUp = () => {
    if (!parentDir) return;
    getEntries(parentDir);
  };

  useEffect(() => {
    invoke<string>('get_home_dir')
      .then((result) => {
        getEntries(result);
        if (dirPathInput.current) {
          dirPathInput.current.value = result;
        }
      })
      .catch((error) => {
        setError(error);
      });
  }, [dirPathInput, getEntries]);

  return (
    <div className={'flex flex-col gap-4'}>
      <div>
        <div className={'flex gap-4'}>
          <input type="text" ref={dirPathInput} className={'p-1'} />
          <button className={'bg-blue-500 p-1'} onClick={handleClick}>
            Get files
          </button>
        </div>
        {!!error && <p className={'mt-2 text-red-800'}>{error}</p>}
      </div>
      {!!currentPath && (
        <div className={'bg-black text-white'}>
          <div className={'flex items-center gap-2 bg-white/40 p-2'}>
            {parentDir !== null && (
              <button onClick={handleUp}>
                <CornerLeftUp size={'1em'} />
              </button>
            )}
            <span>{currentPath}</span>
          </div>
          <div className={'p-2 text-sm'}>
            {entries.length > 0 ? (
              <ul className={'flex flex-col'}>
                {entries.map((file) => (
                  <li
                    key={file.name}
                    className={cn(
                      '',
                      file.is_dir
                        ? 'cursor-pointer font-bold text-blue-300'
                        : '',
                    )}
                  >
                    <span
                      className={cn(file.is_dir && 'hover:underline')}
                      onClick={() => handleClickPath(file)}
                    >
                      {file.path}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className={
                  'pointer-events-none select-none text-center text-gray-400'
                }
              >
                - empty -
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
