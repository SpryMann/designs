import { DateTimePicker } from './DateTimePicker.ts';

document.addEventListener('DOMContentLoaded', () => {
  setupPicker();
});

function setupPicker() {
  const pickerElement = document.querySelector<HTMLDivElement>('#picker');
  if (!pickerElement) return;

  new DateTimePicker(pickerElement);
}
