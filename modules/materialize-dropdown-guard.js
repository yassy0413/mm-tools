("use strict");

const DROPDOWN_OPEN_CLASS = "materialize-dropdown-open";
const CLOSE_GUARD_DELAY_MS = 250;
let closeGuardTimer = null;

export const initGuardedDropdown = ($trigger, $content, options = {}) => {
  const { onOpenStart, onCloseEnd, ...dropdownOptions } = options;

  $content.on("pointerdown mousedown touchstart click", (event) => {
    event.stopPropagation();
  });

  $trigger.dropdown({
    ...dropdownOptions,
    onOpenStart(element) {
      clearTimeout(closeGuardTimer);
      document.body.classList.add(DROPDOWN_OPEN_CLASS);
      onOpenStart?.call(this, element);
    },
    onCloseEnd(element) {
      closeGuardTimer = setTimeout(() => {
        document.body.classList.remove(DROPDOWN_OPEN_CLASS);
      }, CLOSE_GUARD_DELAY_MS);
      onCloseEnd?.call(this, element);
    },
  });
};
