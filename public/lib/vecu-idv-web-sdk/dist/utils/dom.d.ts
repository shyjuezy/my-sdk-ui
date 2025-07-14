export declare function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, attributes?: Record<string, string>, children?: (HTMLElement | string)[]): HTMLElementTagNameMap[K];
export declare function removeElement(element: HTMLElement): void;
export declare function clearElement(element: HTMLElement): void;
export declare function addClass(element: HTMLElement, ...classNames: string[]): void;
export declare function removeClass(element: HTMLElement, ...classNames: string[]): void;
export declare function hasClass(element: HTMLElement, className: string): boolean;
export declare function toggleClass(element: HTMLElement, className: string, force?: boolean): boolean;
export declare function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void;
export declare function getViewportDimensions(): {
    width: number;
    height: number;
};
export declare function isElementVisible(element: HTMLElement): boolean;
export declare function waitForElement(selector: string, timeout?: number): Promise<HTMLElement>;
export declare function createModal(content: HTMLElement, options?: {
    className?: string;
    closeOnBackdrop?: boolean;
    onClose?: () => void;
}): HTMLElement;
export declare function lockBodyScroll(): void;
export declare function unlockBodyScroll(): void;
export declare function injectStyles(styles: string, id?: string): HTMLStyleElement;
export declare function loadScript(src: string, attributes?: Record<string, string>): Promise<void>;
export declare function isInIframe(): boolean;
export declare function getScrollbarWidth(): number;
//# sourceMappingURL=dom.d.ts.map