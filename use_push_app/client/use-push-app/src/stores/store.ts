
/*
   \\
    \\_
     (')
    / )=
  o( )_
*/

export class Store {
  protected static _instance: Store;

  // can't use protected constructor with InstanceType<T> :/
  constructor() {
    const _constructor = this.constructor as typeof Store;
    if (_constructor.name === "Store") {
      throw new Error("Instance must be created only with child Classes");
    }

    if (_constructor._instance) {
      throw new Error("Store already was created. Use getStore static method instead of constructor");
    }

    _constructor._instance = this;
  }

  load(): Promise<any> {
    return Promise.reject()
  }

  static getStore<T extends typeof Store>(this: T): InstanceType<T> {
    if (this.name === "Store") {
      throw new Error("Instance must be created only with sub Classes");
    }

    if (!this._instance) {
      this._instance = new this();
    }

    return this._instance as InstanceType<T>;
  }
}
