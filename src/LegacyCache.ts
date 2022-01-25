// Not use. But just keep here in case
class Entity<KeyType, ValueType> {
  private value: ValueType | null = null;
  private cache = new Map<KeyType, Entity<KeyType, ValueType>>();
  private parent: Entity<KeyType, ValueType> | null;

  constructor(parent: Entity<KeyType, ValueType> | null = null) {
    this.parent = parent;
  }

  get(keys: KeyType[]): ValueType | null {
    if (!keys.length) {
      return this.value;
    }

    const [first, ...rest] = keys;
    const subEntity = this.cache.get(first);
    return subEntity ? subEntity.get(rest) : null;
  }

  update(
    keys: KeyType[],
    valueFn: (origin: ValueType | null) => ValueType | null,
  ) {
    if (!keys.length) {
      this.value = valueFn(this.value);
      this.flush();

      return;
    }

    const [first, ...rest] = keys;
    if (!this.cache.has(first)) {
      this.cache.set(first, new Entity(this));
    }

    this.cache.get(first)!.update(rest, valueFn);
  }

  isEmpty() {
    return this.value === null && this.cache.size === 0;
  }

  // Clean up if current entity do not have value & children
  private flush() {
    // Not clean if has content or not have parent
    if (!this.isEmpty() || !this.parent) {
      return;
    }

    // Clean up parent children
    this.parent.cache.forEach((entity, key) => {
      if (entity === this) {
        this.parent!.cache.delete(key);
      }
    });

    // Bubble up to parent
    this.parent.flush();
  }
}

export default Entity;
