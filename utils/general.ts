export function arrayToOptions(values: string[]) {
  return values.map(function (value) {
    return {
      label: value,
      value: value.toLowerCase().split(" ").join("-"),
    };
  });
}

export function addValuesFromLabelToOptions(options: Record<string, string>[]) {
  return options.map(function (option) {
    return {
      ...option,
      value: option.label.toLowerCase().split(" ").join("-"),
    };
  });
}
