document.addEventListener('DOMContentLoaded', () => {
  setupDrawer();
  setupWheelPickers();
});

function setupDrawer() {
  const drawerElement = document.querySelector<HTMLDivElement>('#drawer');
  const openButton = document.querySelector<HTMLButtonElement>(
    '#weightSettingsButton',
  );

  if (!drawerElement || !openButton) return;

  openButton.addEventListener('click', () => {
    if (!drawer) return;

    drawer.onOpen();
  });

  const drawer = new Drawer(drawerElement);
}

function setupWheelPickers() {
  const kgWP = document.querySelector<HTMLDivElement>('#kgWheelPicker');
  const kgItems = Array.from(Array(100), (_, index) => ({
    id: index + 1,
    label: (index + 1).toString(),
  }));
  const gWP = document.querySelector<HTMLDivElement>('#gWheelPicker');
  const gItems = Array.from(Array(10), (_, index) => ({
    id: index + 1,
    label: `.${index}`,
  }));
  [
    { elem: kgWP, items: kgItems },
    { elem: gWP, items: gItems },
  ].forEach(({ elem, items }) => {
    if (!elem) return;

    new WheelPicker(elem, items);
  });
}
