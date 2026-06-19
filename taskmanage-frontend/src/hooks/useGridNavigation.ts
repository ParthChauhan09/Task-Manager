import { useEffect } from 'react';

export function useGridNavigation(
    containerRef: React.RefObject<HTMLElement | null>,
    itemSelector: string
) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const container = containerRef.current;
            if (!container) return;

            // Only care about arrow keys
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                return;
            }

            // If user is typing in an input, do nothing
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement
            ) {
                return;
            }

            const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
            if (items.length === 0) return;

            // If focus is not inside the container, assume we want to focus the first item
            // if they press an arrow key, to jump into the grid.
            if (!container.contains(document.activeElement)) {
                e.preventDefault();
                items[0].focus();
                return;
            }

            const currentIndex = items.indexOf(document.activeElement as HTMLElement);
            if (currentIndex === -1) return;

            // Robust column calculation: find first item with an offsetTop significantly greater
            let cols = items.findIndex(item => (item.offsetTop - items[0].offsetTop) > 10);
            if (cols <= 0) cols = items.length;

            let nextIndex = currentIndex;
            switch (e.key) {
                case 'ArrowRight':
                    nextIndex = currentIndex + 1;
                    break;
                case 'ArrowLeft':
                    nextIndex = currentIndex - 1;
                    break;
                case 'ArrowDown':
                    nextIndex = currentIndex + cols;
                    break;
                case 'ArrowUp':
                    nextIndex = currentIndex - cols;
                    break;
            }

            if (nextIndex >= 0 && nextIndex < items.length) {
                e.preventDefault();
                items[nextIndex].focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [containerRef, itemSelector]);
}
