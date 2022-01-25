import type { CSSInterpolation } from './useStyleRegister';

class Keyframe {
  private name: string;
  style: CSSInterpolation;

  constructor(name: string, style: CSSInterpolation) {
    this.name = name;
    this.style = style;
  }

  getName(hashId: string = ''): string {
    return `${hashId}-${this.name}`;
  }

  _keyframe = true;
}

export default Keyframe;
