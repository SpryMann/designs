export type DropdownItem = {
  id: number;
  label: string;
  [key: string]: unknown;
};

type DropdownOptions = {
  placeholder?: string;
  renderItem?: (item: DropdownItem) => HTMLButtonElement;
  renderSelected?: (item: DropdownItem) => HTMLElement;
};

type DropdownElements = {
  trigger: HTMLButtonElement;
  input: HTMLInputElement;
  options: HTMLDivElement;
  wrapper: HTMLDivElement;
};

type DropdownState = {
  isOpen: boolean;
  controller: AbortController | null;
  timeoutId: number | null;
  selectedId: number | null;
};

export class Dropdown {
  private root: HTMLDivElement;
  private elements: DropdownElements = {
    trigger: document.createElement('button'),
    input: document.createElement('input'),
    options: document.createElement('div'),
    wrapper: document.createElement('div'),
  };

  private icons = {
    check: `<path d="M20 6 9 17l-5-5"/>`,
    'chevrons-up-down': `<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>`,
    search: `<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>`,
  };

  private items: Array<DropdownItem> = [];
  private options: DropdownOptions = {};
  private state: DropdownState = {
    isOpen: false,
    controller: null,
    timeoutId: null,
    selectedId: null,
  };

  public constructor(
    rootElement: HTMLDivElement,
    items: Array<DropdownItem>,
    options: DropdownOptions = {},
  ) {
    this.root = rootElement;
    this.items = items;
    this.options = options;

    this.render();
    this.addListeners();
  }

  private addListeners() {
    this.elements.trigger.addEventListener('click', () => this.onToggleOpen());
    this.elements.input.addEventListener('input', () => this.onSearch());
    this.elements.options.addEventListener('click', (e) =>
      this.onOptionsClick(e),
    );
  }

  private onToggleOpen(): void {
    this.state.isOpen = !this.state.isOpen;
    this.elements.trigger.setAttribute(
      'aria-expanded',
      this.state.isOpen.toString(),
    );

    if (this.state.isOpen) {
      if (this.state.controller) {
        this.state.controller.abort();
      }

      this.root.dataset.state = 'open';
      this.state.controller = new AbortController();
      const signal = this.state.controller.signal;

      window.addEventListener('click', (e) => this.onWindowClick(e), {
        signal,
      });
      window.addEventListener('keydown', (e) => this.onKeyDown(e), { signal });

      return;
    }

    this.root.dataset.state = 'closed';

    if (this.state.controller) {
      this.state.controller.abort();
      this.state.controller = null;
    }
  }

  private onWindowClick(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    if (target !== this.root && !this.root.contains(target)) {
      this.onToggleOpen();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onToggleOpen();
    }
  }

  private onSearch(): void {
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }

    this.state.timeoutId = setTimeout(() => {
      const query = this.elements.input.value.trim().toLowerCase();
      this.filterOptions(query);
    }, 300);
  }

  private onOptionsClick(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const option = target.closest('button');
    if (!option || !option.dataset.option) return;

    const selectedOption = this.items.find(
      (item) => item.id === parseInt(option.dataset.option || '-1', 10),
    );
    if (!selectedOption || selectedOption.id === this.state.selectedId) return;

    this.state.selectedId = selectedOption.id;

    const options = this.elements.options.querySelectorAll('button');
    options.forEach((item) => {
      if (!item.dataset.option) return;
      if (item.dataset.option !== this.state.selectedId?.toString()) {
        item.querySelector('svg.check')?.remove();
        return;
      }

      item.append(this.getIcon('check', { className: 'check' }));
    });

    let selected = this.options.renderSelected?.(selectedOption);

    if (!selected) {
      selected = document.createElement('span');
      selected.className = 'dropdown__label';
      selected.textContent = selectedOption.label;
      this.elements.trigger.dataset.placeholder = 'false';
    }

    this.elements.trigger.innerHTML = '';
    this.elements.trigger.append(selected, this.getIcon('chevrons-up-down'));

    this.onToggleOpen();
  }

  private filterOptions(query: string): void {
    const filtered = query
      ? this.items.filter((item) => item.label.toLowerCase().startsWith(query))
      : [...this.items];

    this.elements.options.innerHTML = '';

    this.renderOptions(filtered);
  }

  private render(): void {
    this.setupTrigger();
    this.setupContent();
    this.root.append(this.elements.trigger, this.elements.wrapper);
  }

  private setupTrigger(): void {
    const label = document.createElement('span');
    label.className = 'dropdown__label';
    label.textContent = this.options.placeholder ?? 'Select an item';

    this.elements.trigger = document.createElement('button');
    this.elements.trigger.className = 'dropdown__trigger';
    this.elements.trigger.type = 'button';
    this.elements.trigger.setAttribute('aria-haspopup', 'listbox');
    this.elements.trigger.setAttribute('aria-expanded', 'false');
    this.elements.trigger.append(label, this.getIcon('chevrons-up-down'));
  }

  private setupSearch(): HTMLDivElement {
    this.elements.input.className = 'dropdown-search__input';
    this.elements.input.type = 'text';
    this.elements.input.placeholder = 'Search...';

    const search = document.createElement('div');
    search.className = 'dropdown-search';
    search.append(this.getIcon('search'), this.elements.input);

    return search;
  }

  private renderOptions(items: Array<DropdownItem>): void {
    if (!items.length) {
      const paragraph = document.createElement('p');
      paragraph.className = 'dropdown__empty';
      paragraph.textContent = 'No elements';

      this.elements.options.className = 'dropdown__options';
      this.elements.options.append(paragraph);

      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      let option = this.options.renderItem?.(item);

      if (!option) {
        option = document.createElement('button');
        option.className = 'dropdown-option';
        option.type = 'button';
        option.textContent = item.label;
      }

      option.dataset.option = item.id.toString();

      if (item.id === this.state.selectedId) {
        option.append(this.getIcon('check', { className: 'check' }));
      }

      fragment.append(option);
    });

    this.elements.options.className = 'dropdown__options';
    this.elements.options.append(fragment);
  }

  private setupContent(): void {
    const search = this.setupSearch();
    this.renderOptions(this.items);

    const content = document.createElement('div');
    content.className = 'dropdown__content';
    content.setAttribute('role', 'listbox');
    content.id = `dropdown-${this.root.id || 'default'}`;
    content.append(search, this.elements.options);

    this.elements.wrapper.className = 'dropdown__wrapper';
    this.elements.wrapper.append(content);
  }

  private getIcon(
    type: keyof typeof this.icons,
    options: { className?: string; filled?: boolean } = {
      className: '',
      filled: false,
    },
  ): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (options.className) svg.setAttribute('class', options.className);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', options.filled ? 'currentColor' : 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = this.icons[type];

    return svg;
  }
}
