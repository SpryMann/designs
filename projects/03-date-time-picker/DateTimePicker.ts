type DateTimePickerElements = {
  calendarHeading: HTMLParagraphElement;
  daysContainer: HTMLDivElement;
  timesContainer: HTMLDivElement;
  message: HTMLParagraphElement;
};

type DateTimePickerControls = {
  prevMonth: HTMLButtonElement;
  nextMonth: HTMLButtonElement;
};

type DateTimePickerState = {
  currentMonth: number;
  currentYear: number;
  selectedDate: Date | null;
  selectedTime: string | null;
};

export class DateTimePicker {
  private root: HTMLDivElement;

  private elements: DateTimePickerElements = {
    calendarHeading: document.createElement('p'),
    daysContainer: document.createElement('div'),
    timesContainer: document.createElement('div'),
    message: document.createElement('p'),
  };

  private controls: DateTimePickerControls = {
    prevMonth: document.createElement('button'),
    nextMonth: document.createElement('button'),
  };

  private state: DateTimePickerState = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,
    selectedTime: null,
  };

  private readonly icons = {
    'chevron-left': `<path d="m15 18-6-6 6-6"/>`,
    'chevron-right': `<path d="m9 18 6-6-6-6"/>`,
  };
  private readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  public constructor(rootElement: HTMLDivElement) {
    this.root = rootElement;

    this.render();
    this.addListeners();
  }

  private addListeners(): void {
    this.controls.prevMonth.addEventListener('click', () =>
      this.onPrevMonthClick(),
    );
    this.controls.nextMonth.addEventListener('click', () =>
      this.onNextMonthClick(),
    );
    this.elements.daysContainer.addEventListener('click', (e) =>
      this.onDaysClick(e),
    );
    this.elements.timesContainer.addEventListener('click', (e) =>
      this.onTimesClick(e),
    );
  }

  private onPrevMonthClick(): void {
    const date = new Date(
      this.state.currentYear,
      this.state.currentMonth - 1,
      1,
    );
    this.state.currentMonth = date.getMonth();
    this.state.currentYear = date.getFullYear();

    this.renderCalendarHeading();
    this.renderCalendarDays();
  }

  private onNextMonthClick(): void {
    const date = new Date(
      this.state.currentYear,
      this.state.currentMonth + 1,
      1,
    );
    this.state.currentMonth = date.getMonth();
    this.state.currentYear = date.getFullYear();

    this.renderCalendarHeading();
    this.renderCalendarDays();
  }

  private onDaysClick(event: PointerEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const selectedOption = target.closest<HTMLButtonElement>(
      'button.calendar__day',
    );
    if (!selectedOption || !selectedOption.dataset.day) return;

    const selectedDate = new Date(
      this.state.currentYear,
      this.state.currentMonth,
      parseInt(selectedOption.dataset.day, 10),
    );

    if (selectedDate === this.state.selectedDate) return;

    this.state.selectedDate = selectedDate;
    const options =
      this.elements.daysContainer.querySelectorAll<HTMLButtonElement>(
        'button.calendar__day',
      );

    options.forEach((option) => {
      const isSelected =
        !!option.dataset.day &&
        option.dataset.day === selectedOption.dataset.day;
      option.classList[isSelected ? 'add' : 'remove']('selected');
    });

    this.renderMessage();
  }

  private onTimesClick(event: PointerEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const selectedOption = target.closest<HTMLButtonElement>(
      'button.time-picker__time',
    );
    if (!selectedOption || !selectedOption.dataset.time) return;

    if (this.state.selectedTime === selectedOption.dataset.time) return;

    this.state.selectedTime = selectedOption.dataset.time;
    const options =
      this.elements.timesContainer.querySelectorAll<HTMLButtonElement>(
        'button.time-picker__time',
      );

    options.forEach((option) => {
      const isSelected =
        !!option.dataset.time &&
        option.dataset.time === selectedOption.dataset.time;
      option.classList[isSelected ? 'add' : 'remove']('selected');
    });

    this.renderMessage();
  }

  private calculateDaysArray(): Array<number | null> {
    const lastDay = new Date(
      this.state.currentYear,
      this.state.currentMonth + 1,
      0,
      0,
      0,
      0,
      0,
    ).getDate();
    const firstWeekday = new Date(
      this.state.currentYear,
      this.state.currentMonth,
      1,
      0,
      0,
      0,
      0,
    ).getDay();

    return [
      ...Array(firstWeekday - 1 >= 0 ? firstWeekday - 1 : 6).map(() => null),
      ...Array.from(Array(lastDay)).map((_, index) => index + 1),
    ];
  }

  private renderCalendarHeading(): void {
    this.elements.calendarHeading.textContent = new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'long',
        year: 'numeric',
      },
    ).format(
      new Date(this.state.currentYear, this.state.currentMonth, 1, 0, 0, 0, 0),
    );
  }

  private renderCalendarDays(): void {
    const fragment = document.createDocumentFragment();
    const days = this.calculateDaysArray();
    const isCurrentMonthAndYear =
      !!this.state.selectedDate &&
      this.state.selectedDate.getFullYear() === this.state.currentYear &&
      this.state.selectedDate.getMonth() === this.state.currentMonth;

    days.forEach((day) => {
      if (!day) {
        const div = document.createElement('div');
        fragment.append(div);
        return;
      }

      const isSelected =
        isCurrentMonthAndYear && this.state.selectedDate!.getDate() === day;
      const button = document.createElement('button');
      button.className = 'calendar__day';
      if (isSelected) button.classList.add('selected');
      button.type = 'button';
      button.textContent = day.toString();
      button.dataset.day = day.toString();

      fragment.append(button);
    });

    this.elements.daysContainer.innerHTML = '';
    this.elements.daysContainer.append(fragment);
  }

  private renderMessage(): void {
    const messages = {
      'no-date': 'Pick a date',
      'no-time': 'Pick a time',
      'no-date-time': 'Pick a date and a time',
    };

    if (this.state.selectedDate && this.state.selectedTime) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: '2-digit',
      });
      this.elements.message.textContent = `Your meeting is booked for ${formatter.format(this.state.selectedDate)} at ${this.state.selectedTime}`;
      return;
    }

    if (this.state.selectedDate && !this.state.selectedTime) {
      this.elements.message.textContent = messages['no-time'];
      return;
    }

    if (!this.state.selectedDate && this.state.selectedTime) {
      this.elements.message.textContent = messages['no-date'];
      return;
    }

    this.elements.message.textContent = messages['no-date-time'];
  }

  private render() {
    const body = this.setupBody();
    const footer = this.setupFooter();

    this.root.append(body, footer);
  }

  private setupBody(): HTMLDivElement {
    const calendar = this.setupCalendar();

    const calendarWrapper = document.createElement('div');
    calendarWrapper.className = 'picker__calendar';
    calendarWrapper.append(calendar);

    const timePicker = this.setupTimePicker();

    const body = document.createElement('div');
    body.className = 'picker__body';
    body.append(calendarWrapper, timePicker);

    return body;
  }

  private setupCalendar(): HTMLDivElement {
    const header = this.setupCalendarHeader();
    const content = this.setupCalendarContent();

    const calendar = document.createElement('div');
    calendar.className = 'calendar';
    calendar.append(header, content);

    return calendar;
  }

  private setupCalendarHeader(): HTMLDivElement {
    this.controls.prevMonth.className = 'icon-button';
    this.controls.prevMonth.type = 'button';
    this.controls.prevMonth.ariaLabel = 'Previous month';
    this.controls.prevMonth.append(this.getIcon('chevron-left'));

    this.elements.calendarHeading.className = 'calendar__heading';
    this.renderCalendarHeading();

    this.controls.nextMonth.className = 'icon-button';
    this.controls.nextMonth.type = 'button';
    this.controls.nextMonth.ariaLabel = 'Next month';
    this.controls.nextMonth.append(this.getIcon('chevron-right'));

    const header = document.createElement('div');
    header.className = 'calendar__header';
    header.append(
      this.controls.prevMonth,
      this.elements.calendarHeading,
      this.controls.nextMonth,
    );

    return header;
  }

  private setupCalendarContent(): HTMLDivElement {
    const weekdaysWrapper = this.setupCalendarWeekdays();
    this.setupCalendarDays();

    const content = document.createElement('div');
    content.className = 'calendar__content';
    content.append(weekdaysWrapper, this.elements.daysContainer);

    return content;
  }

  private setupCalendarWeekdays(): HTMLDivElement {
    const fragment = document.createDocumentFragment();

    this.weekdays.forEach((day) => {
      const block = document.createElement('div');
      block.className = 'calendar__weekday';
      block.textContent = day;

      fragment.append(block);
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'calendar__weekdays';
    wrapper.append(fragment);

    return wrapper;
  }

  private setupCalendarDays(): void {
    this.elements.daysContainer.className = 'calendar__days';
    this.renderCalendarDays();
  }

  private setupTimePicker(): HTMLDivElement {
    const fragment = document.createDocumentFragment();
    // TODO: Make it dynamic
    const times = [
      '09:00',
      '09:15',
      '09:30',
      '09:45',
      '10:00',
      '10:15',
      '10:30',
      '10:45',
    ];

    times.forEach((item) => {
      const option = document.createElement('button');
      option.className = 'time-picker__time';
      option.type = 'button';
      option.textContent = item;
      option.dataset.time = item;

      fragment.append(option);
    });

    this.elements.timesContainer.className = 'time-picker__times';
    this.elements.timesContainer.append(fragment);

    const wrapper = document.createElement('div');
    wrapper.className = 'time-picker';
    wrapper.append(this.elements.timesContainer);

    return wrapper;
  }

  private setupFooter(): HTMLDivElement {
    this.elements.message.className = 'picker__message';
    this.renderMessage();

    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'button';
    button.textContent = 'Continue';
    button.disabled = true;

    const wrapper = document.createElement('div');
    wrapper.className = 'picker__footer';
    wrapper.append(this.elements.message, button);

    return wrapper;
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
