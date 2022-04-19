import type { CSSInterpolation } from './useStyleRegister';
import { animationStatistics } from './useStyleRegister';

class Keyframe {
  private name: string;
  style: CSSInterpolation;

  constructor(name: string, style: CSSInterpolation) {
    this.name = name;
    this.style = style;
  }

  getName(hashId: string = ''): string {
    const animationName = hashId ? `${hashId}-${this.name}` : this.name;
    if (animationStatistics[animationName] === undefined) {
      animationStatistics[animationName] = true;
    }

    return animationName;
  }

  _keyframe = true;
}

export default Keyframe;
