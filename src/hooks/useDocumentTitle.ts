import { useEffect } from 'react';

/** Define o título da aba do navegador enquanto a página estiver montada. */
export const useDocumentTitle = (title: string | undefined | null) => {
  useEffect(() => {
    if (!title?.trim()) return;
    const previous = document.title;
    document.title = title.trim();
    return () => {
      document.title = previous;
    };
  }, [title]);
};
