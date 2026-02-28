declare module 'quicklink' {
  interface ListenOptions {
    el?: Element;
    limit?: number;
    throttle?: number;
    timeout?: number;
    timeoutFn?: (callback: () => void, options: { timeout: number }) => void;
    priority?: boolean;
    origins?: (string | null | undefined)[];
    ignores?: (RegExp | ((uri: string, element: HTMLAnchorElement) => boolean))[];
    onError?: (error: Error) => void;
    hrefFn?: (element: HTMLAnchorElement) => string;
    prefetchChunks?: (element: HTMLAnchorElement, prefetch: (url: string) => void) => void;
  }

  export function listen(options?: ListenOptions): () => void;
  export function prefetch(
    urls: string | string[],
    isPriority?: boolean,
  ): Promise<void[]>;
}
