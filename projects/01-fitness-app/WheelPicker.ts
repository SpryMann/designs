type WheelPickerItem = {
  id: number;
  label: string;
};

type WheelPickerOptions = {
  optionHeight: number;
  maxBounce: number;
  inertiaDeceleration: number;
  maxVelocity: number;
};

type WheelPickerState = {
  currentIndex: number;
  isDragging: boolean;
  isAnimating: boolean;
  clientY: number;
  startTransform: number;
  minOffset: number;
  maxOffset: number;
  lastMoveTime: number;
  lastMoveOffset: number;
  velocity: number;
  animationFrameId: number | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class WheelPicker {
  private root: HTMLDivElement;
  private container = document.createElement('div');

  private items: Array<WheelPickerItem> = [];

  private state: WheelPickerState = {
    currentIndex: 0,
    isDragging: false,
    isAnimating: false,
    clientY: 0,
    startTransform: 0,
    minOffset: 0,
    maxOffset: 0,
    lastMoveTime: 0,
    lastMoveOffset: 0,
    velocity: 0,
    animationFrameId: null,
  };

  private readonly options: WheelPickerOptions = {
    optionHeight: 72,
    maxBounce: 0.3,
    inertiaDeceleration: 0.95,
    maxVelocity: 3000,
  };

  public constructor(
    rootElement: HTMLDivElement,
    items: Array<WheelPickerItem>,
  ) {
    this.root = rootElement;
    this.items = items;
    this.state.currentIndex = Math.floor(this.items.length / 2);
    this.state.maxOffset = this.getOffsetForIndex(0);
    this.state.minOffset = this.getOffsetForIndex(this.items.length - 1);

    this.render();
    this.addListeners();
  }

  private addListeners() {
    this.root.addEventListener('pointerdown', (e) => this.onDragStart(e));
  }

  private onDragStart(event: PointerEvent) {
    event.preventDefault();

    this.stopInertia();

    this.state.isDragging = true;
    this.state.isAnimating = false;
    this.state.clientY = event.clientY;
    this.state.startTransform = this.getCurrentOffset();
    this.state.lastMoveTime = performance.now();
    this.state.lastMoveOffset = this.state.startTransform;
    this.state.velocity = 0;
    this.container.style.transition = 'none';

    const controller = new AbortController();
    const signal = controller.signal;

    const onMove = (e: PointerEvent) => {
      if (!this.state.isDragging) return;
      e.preventDefault();

      const now = performance.now();
      const deltaY = e.clientY - this.state.clientY;
      let offset = this.state.startTransform + deltaY;

      if (offset > this.state.maxOffset) {
        const over = offset - this.state.maxOffset;
        offset = this.state.maxOffset + over * this.options.maxBounce;
      } else if (offset < this.state.minOffset) {
        const over = this.state.minOffset - offset;
        offset = this.state.minOffset - over * this.options.maxBounce;
      }

      const timeDelta = now - this.state.lastMoveTime;

      if (timeDelta > 10) {
        const offsetDelta = offset - this.state.lastMoveOffset;
        const velocity = (offsetDelta / timeDelta) * 1000;
        this.state.velocity = this.state.velocity * 0.6 + velocity * 0.4;
        this.state.velocity = Math.max(
          -this.options.maxVelocity,
          Math.min(this.options.maxVelocity, this.state.velocity),
        );

        this.state.lastMoveTime = now;
        this.state.lastMoveOffset = offset;
      }

      this.container.style.transform = `translateY(${offset}px)`;

      const rawIndex = this.getIndexFromOffset(offset);
      const nearestIndex = Math.max(
        0,
        Math.min(this.items.length - 1, Math.round(rawIndex)),
      );

      this.highlightOption(nearestIndex);
    };

    const onCancel = () => {
      if (!this.state.isDragging) return;
      this.state.isDragging = false;

      const currentOffset = this.getCurrentOffset();

      if (Math.abs(this.state.velocity) > 50) {
        this.startInertia(currentOffset, this.state.velocity);
      } else {
        const rawIndex = this.getIndexFromOffset(currentOffset);
        const nearestIndex = Math.max(
          0,
          Math.min(this.items.length - 1, Math.round(rawIndex)),
        );

        this.setIndex(nearestIndex);
      }

      if (controller) {
        controller.abort();
      }
    };

    window.addEventListener('pointermove', onMove, { signal });
    window.addEventListener('pointercancel', onCancel, { signal });
    window.addEventListener('pointerup', onCancel, { signal });
  }

  private startInertia(startOffset: number, velocity: number) {
    this.state.isAnimating = true;
    this.container.style.transition = 'none';

    let currentOffset = startOffset;
    let currentVelocity = velocity;

    const animate = () => {
      if (!this.state.isAnimating) return;

      currentVelocity *= this.options.inertiaDeceleration;

      if (Math.abs(currentVelocity) < 5) {
        this.finishInertia(currentOffset);
        return;
      }

      let newOffset = currentOffset + currentVelocity / 60;
      const isOverMax = newOffset > this.state.maxOffset;
      const isUnderMin = newOffset < this.state.minOffset;

      if (isOverMax || isUnderMin) {
        const boundary = isOverMax
          ? this.state.maxOffset
          : this.state.minOffset;
        const timeToBoundary = Math.abs(
          (boundary - currentOffset) / currentVelocity,
        );

        if (timeToBoundary < 0.016) {
          this.finishInertia(boundary);
          return;
        }

        const over = newOffset - boundary;
        newOffset = boundary + over * this.options.maxBounce * 0.5;
        currentVelocity *= -0.3;
      }

      currentOffset = newOffset;
      this.container.style.transform = `translateY(${currentOffset}px)`;

      const rawIndex = this.getIndexFromOffset(currentOffset);
      const nearestIndex = Math.max(
        0,
        Math.min(this.items.length - 1, Math.round(rawIndex)),
      );

      this.highlightOption(nearestIndex);

      this.state.animationFrameId = requestAnimationFrame(animate);
    };

    this.state.animationFrameId = requestAnimationFrame(animate);
  }

  private finishInertia(offset: number) {
    this.state.isAnimating = false;

    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = null;
    }

    const rawIndex = this.getIndexFromOffset(offset);
    const nearestIndex = Math.max(
      0,
      Math.min(this.items.length - 1, Math.round(rawIndex)),
    );

    this.setIndex(nearestIndex);
  }

  private stopInertia() {
    if (!this.state.isAnimating) return;

    this.state.isAnimating = false;

    if (!this.state.animationFrameId) return;

    cancelAnimationFrame(this.state.animationFrameId);
    this.state.animationFrameId = null;
  }

  private getIndexFromOffset(offset: number): number {
    const relativeOffset = this.state.maxOffset - offset;
    return relativeOffset / this.options.optionHeight;
  }

  private getOffsetForIndex(index: number): number {
    const wrapperHeight = this.root.clientHeight;
    const centerOffset = (wrapperHeight - this.options.optionHeight) / 2;
    return -(index * this.options.optionHeight) - centerOffset;
  }

  private getCurrentOffset(): number {
    const transform = this.container.style.transform;
    if (!transform || !transform.includes('translateY'))
      return this.getOffsetForIndex(this.state.currentIndex);

    const match = transform.match(/translateY\(([^)]+)\)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private setIndex(index: number) {
    let newIndex = index;

    if (index < 0) newIndex = 0;
    if (index >= this.items.length) newIndex = this.items.length - 1;

    this.state.currentIndex = newIndex;
    this.updatePicker(true);
  }

  private render() {
    this.items.forEach((item) => {
      const option = document.createElement('div');
      option.className = 'wheel-picker__option';
      option.dataset.id = item.id.toString();
      option.textContent = item.label;

      this.container.append(option);
    });

    this.container.className = 'wheel-picker__options';
    this.root.innerHTML = '';
    this.root.append(this.container);

    this.updatePicker();
  }

  private updatePicker(animate = false) {
    const offset = this.getOffsetForIndex(this.state.currentIndex);
    if (animate)
      this.container.style.transition =
        'transform 175ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    this.container.style.transform = `translateY(${offset}px)`;
    this.highlightOption(this.state.currentIndex);
  }

  private highlightOption(index: number) {
    const options = this.container.querySelectorAll<HTMLDivElement>(
      '.wheel-picker__option',
    );

    options.forEach((option, i) => {
      option.classList.toggle('active', i === index);
    });
  }
}
