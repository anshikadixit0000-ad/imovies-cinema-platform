const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MemoryStore {
  constructor() {
    this.dataFile = path.join(__dirname, '..', '..', 'data_store.json');
    this.data = {
      users: [],
      movies: [],
      theatres: [],
      shows: [],
      bookings: [],
      payments: [],
      notifications: []
    };
    this.isMemoryOnly = false;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf8');
        this.data = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[MemoryStore] Notice: fallback file load failed, using empty memory store');
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[MemoryStore] Notice: persistent file save failed');
    }
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  async find(collectionName, query = {}) {
    let items = this.data[collectionName] || [];
    return items.filter(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(collectionName, query = {}) {
    const items = await this.find(collectionName, query);
    return items[0] || null;
  }

  async findById(collectionName, id) {
    return this.findOne(collectionName, { _id: String(id) });
  }

  async create(collectionName, doc) {
    if (!this.data[collectionName]) this.data[collectionName] = [];
    const newDoc = {
      _id: this.generateId(),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data[collectionName].push(newDoc);
    this.save();
    return newDoc;
  }

  async findByIdAndUpdate(collectionName, id, update, options = { new: true }) {
    const items = this.data[collectionName] || [];
    const index = items.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;
    const current = items[index];
    const updated = {
      ...current,
      ...update,
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this.save();
    return updated;
  }

  async findByIdAndDelete(collectionName, id) {
    const items = this.data[collectionName] || [];
    const index = items.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;
    const removed = items.splice(index, 1)[0];
    this.save();
    return removed;
  }
}

module.exports = new MemoryStore();
