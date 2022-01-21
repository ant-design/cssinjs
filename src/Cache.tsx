class Entity<KeyType, ValueType> {
  private value: ValueType | null = null;
  private cache = new Map<KeyType, Entity<KeyType, ValueType>>();

  get(keys: KeyType[]): ValueType | null {
    if (!keys.length) {
      return this.value;
    }

    const [first, ...rest] = keys;
    const subEntity = this.cache.get(first);
    return subEntity ? subEntity.get(rest) : null;
  }

  update(keys: KeyType[], valueFn: (origin: ValueType | null) => ValueType) {
    if (!keys.length) {
      this.value = valueFn(this.value);
      return;
    }

    const [first, ...rest] = keys;
    if (!this.cache.has(first)) {
      this.cache.set(first, new Entity());
    }

    this.cache.get(first)!.update(rest, valueFn);
  }

  // TODO: delete
}

export default Entity;
