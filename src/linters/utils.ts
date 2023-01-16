import devWarning from 'rc-util/lib/warning';
import { LinterInfo } from './interface';

export function lintWarning(message: string, info: LinterInfo) {
  const { path, parentSelectors } = info;

  devWarning(
    false,
    `[Ant Design CSS-in-JS] ${path ? `Error in '${path}': ` : ''}${message}${
      parentSelectors.length
        ? ` Selector info: ${parentSelectors.join(' -> ')})`
        : ''
    }`,
  );
}
