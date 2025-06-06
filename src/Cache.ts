export type KeyType = string | number;
type ValueType = [number, any]; // [times, realValue]

const SPLIT = '%';

/** Connect key with `SPLIT` */
export function pathKey(keys: KeyType[]) {
  return keys.join(SPLIT);
}

/** Record update id for extract static style order. */
let updateId = 0;

class Entity {
  instanceId: string;
  constructor(instanceId: string) {
    this.instanceId = instanceId;
  }

  /** @private Internal cache map. Do not access this directly */
  cache = new Map<string, ValueType>();

  /** @private Record update times for each key */
  updateTimes = new Map<string, number>();

  get(keys: KeyType[]): ValueType | null {
    return this.opGet(pathKey(keys));
  }

  /** A fast get cache with `get` concat. */
  opGet(keyPathStr: string): ValueType | null {
    return this.cache.get(keyPathStr) || null;
  }

  update(
    keys: KeyType[],
    valueFn: (origin: ValueType | null) => ValueType | null,
  ) {
    return this.opUpdate(pathKey(keys), valueFn);
  }

  /** A fast get cache with `get` concat. */
  opUpdate(
    keyPathStr: string,
    valueFn: (origin: ValueType | null) => ValueType | null,
  ) {
    const prevValue = this.cache.get(keyPathStr)!;
    const nextValue = valueFn(prevValue);

    if (nextValue === null) {
      this.cache.delete(keyPathStr);
      this.updateTimes.delete(keyPathStr);
    } else {
      this.cache.set(keyPathStr, nextValue);
      this.updateTimes.set(keyPathStr, updateId);
      updateId += 1;
    }
  }
}

export default Entity;
