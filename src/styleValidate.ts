import devWarning from 'rc-util/lib/warning';

const styleValidate = (
  key: string,
  value: string | number | boolean | null | undefined,
) => {
  switch (key) {
    case 'content':
      // From emotion: https://github.com/emotion-js/emotion/blob/main/packages/serialize/src/index.js#L63
      const contentValuePattern =
        /(attr|counters?|url|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
      const contentValues = ['normal', 'none', 'initial', 'inherit', 'unset'];
      if (
        typeof value !== 'string' ||
        (contentValues.indexOf(value) === -1 &&
          !contentValuePattern.test(value) &&
          (value.charAt(0) !== value.charAt(value.length - 1) ||
            (value.charAt(0) !== '"' && value.charAt(0) !== "'")))
      ) {
        devWarning(
          false,
          `You seem to be using a value for 'content' without quotes, try replacing it with \`content: '"${value}"'\``,
        );
      }
      return;
    case 'marginLeft':
    case 'marginRight':
    case 'paddingLeft':
    case 'paddingRight':
    case 'left':
    case 'right':
    case 'borderLeft':
    case 'borderLeftWidth':
    case 'borderLeftStyle':
    case 'borderLeftColor':
    case 'borderRight':
    case 'borderRightWidth':
    case 'borderRightStyle':
    case 'borderRightColor':
    case 'borderTopLeftRadius':
    case 'borderTopRightRadius':
    case 'borderBottomLeftRadius':
    case 'borderBottomRightRadius':
      devWarning(
        false,
        `You seem to be using non-logical property '${key}' which is not compatible with RTL mode. Please use logical properties and values instead. For more information: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties.`,
      );
      return;
    case 'margin':
    case 'padding':
      if (typeof value === 'string') {
        const valueArr = value.split(' ').map((item) => item.trim());
        if (valueArr.length === 4 && valueArr[1] !== valueArr[3]) {
          devWarning(
            false,
            `You seem to be using '${key}' property with different ${key}Left and ${key}Right, which is not compatible with RTL mode. Please use logical properties and values instead. For more information: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties.`,
          );
        }
      }
      return;
    default:
      return;
  }
};

export default styleValidate;
