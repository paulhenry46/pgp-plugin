// Stand-in for the Bulwark host API in unit tests. State lives on globalThis
// so a test and the bundle under test (which inlines its own copy of this
// module) see the same contacts and settings.
const state = (globalThis.__pluginHostStub ??= { contacts: [], settings: {}, blobs: {} });

const host = {
  log: { info() {}, warn() {}, error() {}, debug() {} },
  plugin: { get settings() { return state.settings; } },
  jmap: { async fetchBlob(id) { return state.blobs[id]; } },
  i18n: { t: (key) => key },
};
export default host;

export const contacts = {
  async search(query) {
    const q = String(query).toLowerCase();
    return state.contacts.filter((c) =>
      Object.values(c.emails || {}).some((e) => e.address.toLowerCase().includes(q)));
  },
  async update(id, patch) {
    Object.assign(state.contacts.find((c) => c.id === id), patch);
  },
  async create(card) {
    state.contacts.push({ id: `c${state.contacts.length + 1}`, ...card });
  },
};
