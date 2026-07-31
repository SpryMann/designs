import { Dropdown, type DropdownItem } from './Dropdown.ts';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}data/02-dropdowns.json`);
    const data = await response.json();

    if ('framework' in data) {
      setupFrameworkDropdown(data.framework);
    }

    if ('status' in data) {
      setupStatusDropdown(data.status);
    }

    if ('country' in data) {
      setupCountryDropdown(data.country);
    }

    if ('currency' in data) {
      setupCurrencyDropdown(data.currency);
    }

    if ('priority' in data) {
      setupPriorityDropdown(data.priority);
    }

    if ('timezone' in data) {
      setupTimezoneDropdown(data.timezone);
    }

    if ('assignee' in data) {
      setupAssigneeDropdown(data.assignee);
    }

    if ('language' in data) {
      setupLanguageDropdown(data.language);
    }

    if ('branch' in data) {
      setupBranchDropdown(data.branch);
    }
  } catch (error) {
    console.log(error);
  }
});

const icons = {
  flag: `<path
        d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"
      />`,
  'git-branch': `<path d="M15 6a9 9 0 0 0-9 9V3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />`,
  globe: `<circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />`,
  languages: `<path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />`,
} as const;

function renderIcon(
  type: keyof typeof icons,
  options: { className?: string; filled?: boolean } = {
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
  svg.innerHTML = icons[type];

  return svg;
}

function renderItemTemplate(element: HTMLElement): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'dropdown-option';
  button.type = 'button';
  button.append(element);

  return button;
}

function setupFrameworkDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#frameworkDropdown');
  if (!element) return;

  new Dropdown(element, data, { placeholder: 'Select framework' });
}

function setupStatusDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#statusDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const chip = document.createElement('div');
    chip.className = `chip bg-${item.color}`;

    const label = document.createElement('p');
    label.className = 'custom-option__label';
    label.textContent = item.label;

    const wrapper = document.createElement('div');
    wrapper.className = `custom-option${compact ? ' compact' : ''}`;
    wrapper.append(chip, label);

    return wrapper;
  };

  new Dropdown(element, data, {
    placeholder: 'Select status',
    renderItem: (item) => renderItemTemplate(renderElement(item)),
    renderSelected: (item) => renderElement(item),
  });
}

function setupCountryDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#countryDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const label = document.createElement('p');
    label.className = 'custom-option__label';
    label.textContent = `${item.flag} ${item.label}`;

    const value = document.createElement('p');
    value.className = 'custom-option__value';
    value.textContent = item.code as string;

    const wrapper = document.createElement('div');
    wrapper.className = `custom-option${compact ? ' compact' : ''}`;
    wrapper.append(label, value);

    return wrapper;
  };

  new Dropdown(element, data, {
    placeholder: 'Select country',
    renderItem: (item) => renderItemTemplate(renderElement(item)),
    renderSelected: (item) => renderElement(item, true),
  });
}

function setupCurrencyDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#currencyDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const badge = document.createElement('div');
    badge.className = 'currency';
    badge.textContent = item.currency as string;

    const label = document.createElement('p');
    label.className = 'custom-option__label';
    label.textContent = item.label;

    const wrapper = document.createElement('div');
    wrapper.className = `custom-option${compact ? ' compact' : ''}`;
    wrapper.append(badge, label);

    return wrapper;
  };

  new Dropdown(element, data, {
    placeholder: 'Select currency',
    renderItem: (item) => renderItemTemplate(renderElement(item)),
    renderSelected: (item) => renderElement(item, true),
  });
}

function setupPriorityDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#priorityDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const label = document.createElement('p');
    label.className = 'custom-option__label';
    label.textContent = item.label;

    const wrapper = document.createElement('div');
    wrapper.className = `custom-option${compact ? ' compact' : ''}`;
    wrapper.append(
      renderIcon('flag', { className: `text-${item.color}` }),
      label,
    );

    return wrapper;
  };

  new Dropdown(element, data, {
    placeholder: 'Select priority',
    renderItem: (item) => renderItemTemplate(renderElement(item)),
    renderSelected: (item) => renderElement(item, true),
  });
}

function setupTimezoneDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#timezoneDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const label = document.createElement('p');
    label.className = 'custom-option__label';
    label.textContent = item.label;

    const value = document.createElement('p');
    value.className = 'custom-option__value';
    value.textContent = item.timezone as string;

    const wrapper = document.createElement('div');
    wrapper.className = `custom-option${compact ? ' compact' : ''}`;
    wrapper.append(renderIcon('globe'), label, value);

    return wrapper;
  };

  new Dropdown(element, data, {
    placeholder: 'Choose timezone',
    renderItem: (item) => renderItemTemplate(renderElement(item)),
    renderSelected: (item) => renderElement(item, true),
  });
}

function setupAssigneeDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#assigneeDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const fragment = document.createDocumentFragment();

    const avatar = document.createElement('div');
    avatar.className = 'assignee__avatar';
    avatar.textContent = item.avatar as string;

    if (compact) {
      const value = document.createElement('p');
      value.className = 'assignee__value';
      value.textContent = item.label;

      fragment.append(avatar, value);
    } else {
      const name = document.createElement('p');
      name.textContent = item.label;

      const email = document.createElement('p');
      email.className = 'assignee__email';
      email.textContent = item.email as string;

      const texts = document.createElement('div');
      texts.className = 'assignee__texts';
      texts.append(name, email);

      fragment.append(avatar, texts);
    }

    const wrapper = document.createElement('div');
    wrapper.className = `assignee${compact ? ' compact' : ''}`;
    wrapper.append(fragment);

    return wrapper;
  };

  const renderItem = (element: HTMLElement): HTMLButtonElement => {
    const button = document.createElement('button');
    button.className = 'dropdown-option big';
    button.type = 'button';
    button.append(element);

    return button;
  };

  new Dropdown(element, data, {
    placeholder: 'Select an assignee',
    renderItem: (item) => renderItem(renderElement(item)),
    renderSelected: (item) => renderElement(item, true),
  });
}

function setupLanguageDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#languageDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const fragment = document.createDocumentFragment();
    const label = document.createElement('p');
    label.className = 'custom-option__label';

    if (compact) {
      label.textContent = item.label;

      fragment.append(renderIcon('languages'), label);
    } else {
      label.textContent = `${item.flag} ${item.label}`;

      const value = document.createElement('p');
      value.className = 'custom-option__value';
      value.textContent = item.language as string;

      fragment.append(label, value);
    }

    const wrapper = document.createElement('div');
    wrapper.className = `custom-option${compact ? ' compact' : ''}`;
    wrapper.append(fragment);

    return wrapper;
  };

  new Dropdown(element, data, {
    placeholder: 'Select language',
    renderItem: (item) => renderItemTemplate(renderElement(item)),
    renderSelected: (item) => renderElement(item, true),
  });
}

function setupBranchDropdown(data: Array<DropdownItem>) {
  const element = document.querySelector<HTMLDivElement>('#branchDropdown');
  if (!element) return;

  const renderElement = (item: DropdownItem, compact = false): HTMLElement => {
    const label = document.createElement('p');
    label.className = 'custom-option__label mono';
    label.textContent = item.label;

    const wrapper = document.createElement('div');
    wrapper.className = `custom-option${compact ? ' compact' : ''}`;
    wrapper.append(renderIcon('git-branch'), label);

    return wrapper;
  };

  new Dropdown(element, data, {
    placeholder: 'Select branch',
    renderItem: (item) => renderItemTemplate(renderElement(item)),
    renderSelected: (item) => renderElement(item, true),
  });
}
