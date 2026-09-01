/**
 * Shared reader for developerConfigs/viewapp.config.json (JSONC with // and /* comments).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const CONFIG_PATH = path.join(ROOT, 'developerConfigs', 'viewapp.config.json');

function stripJsonComments(input) {
  let output = '';
  let index = 0;
  let inString = false;
  let escaped = false;

  while (index < input.length) {
    const char = input[index];
    const next = input[index + 1];

    if (inString) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      index += 1;
      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      index += 1;
      continue;
    }

    if (char === '/' && next === '/') {
      index += 2;
      while (index < input.length && input[index] !== '\n') {
        index += 1;
      }
      continue;
    }

    if (char === '/' && next === '*') {
      index += 2;
      while (index < input.length && !(input[index] === '*' && input[index + 1] === '/')) {
        index += 1;
      }
      index += 2;
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
}

function readDeveloperConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      'Missing developerConfigs/viewapp.config.json — put developer settings in the developerConfigs/ folder.'
    );
  }

  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(stripJsonComments(raw));
}

module.exports = {
  CONFIG_PATH,
  readDeveloperConfig,
  stripJsonComments
};
