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

  update(
    keys: KeyType[],
    valueFn: (origin: ValueType | null) => ValueType | null,
    parent: Entity<KeyType, ValueType> | null = null,
    parentKey: KeyType | null = null,
  ) {
    if (!keys.length) {
      this.value = valueFn(this.value);

      // null to remove
      if (this.value === null && parent) {
        parent.cache.delete(parentKey!);
      }

      return;
    }

    const [first, ...rest] = keys;
    if (!this.cache.has(first)) {
      this.cache.set(first, new Entity());
    }

    this.cache.get(first)!.update(rest, valueFn, this, first);
  }
}

export default Entity;
