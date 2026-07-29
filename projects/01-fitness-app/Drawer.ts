type DrawerState = {
  isDragging: boolean;
  clientY: number;
};

type DrawerOptions = {
  maxDragOffset: number;
  threshold: number;
};

export class Drawer {
  private root: HTMLDivElement;
  private handle: HTMLDivElement;

  private state: DrawerState = {
    isDragging: false,
    clientY: 0,
  };

  private abortController: AbortController | null = null;

  private readonly options: DrawerOptions = {
    maxDragOffset: 0.7,
    threshold: 150,
  };

  public constructor(rootElement: HTMLDivElement) {
    this.root = rootElement;
    this.handle = this.root.querySelector<HTMLDivElement>(
      '.drawer__handle',
    ) as HTMLDivElement;
  }

  public onOpen() {
    this.root.dataset.state = 'open';
    document.body.style.overflow = 'hidden';

    this.addListeners();
  }

  private onClose() {
    this.root.dataset.state = 'closed';
    this.root.style.transform = '';
    document.body.style.overflow = '';

    this.removeListeners();
  }

  private addListeners() {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    this.handle.addEventListener('pointerdown', (e) => this.onDragStart(e), {
      signal,
    });
  }

  private removeListeners() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private onDragStart(event: PointerEvent) {
    event.preventDefault();

    this.state.clientY = event.clientY;
    this.state.isDragging = true;
    this.root.style.transition = 'none';

    const controller = new AbortController();
    const signal = controller.signal;

    const onMove = (e: PointerEvent) => {
      if (!this.state.isDragging) return;
      e.preventDefault();

      const deltaY = e.clientY - this.state.clientY;

      if (deltaY > 0) {
        const maxDrag = window.innerHeight * this.options.maxDragOffset;
        const offset = Math.min(deltaY, maxDrag);
        this.root.style.transform = `translateY(${offset}px)`;
      }
    };
    const onCancel = () => {
      this.state.isDragging = false;
      this.root.style.transition =
        'transform 175ms cubic-bezier(0.42, 0, 0.58, 1)';

      const offsetY = this.getCurrentOffset();

      if (offsetY > this.options.threshold) {
        this.onClose();
      } else {
        this.root.style.transform = '';
      }

      if (controller) {
        controller.abort();
      }
    };

    window.addEventListener('pointermove', onMove, { signal });
    window.addEventListener('pointercancel', onCancel, { signal });
    window.addEventListener('pointerup', onCancel, { signal });
  }

  private getCurrentOffset() {
    const transform = this.root.style.transform;
    if (!transform || !transform.includes('translateY')) return 0;

    const match = transform.match(/translateY\(([^)]+)\)/);
    return match ? parseFloat(match[1]) : 0;
  }
}
