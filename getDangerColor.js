export const getDangerColor = dangerLevel => {
  if (dangerLevel > 0.3) {
    return 'red';
  } else if (dangerLevel > 0.1) {
    return 'yellow';
  } else {
    return 'green';
  }
}
