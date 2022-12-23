export function getStyleText(index = 0) {
  const styleList = Array.from(document.querySelectorAll('style'));

  return styleList[index].innerHTML;
}
