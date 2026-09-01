'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { readDeveloperConfig } = require('./lib/read-developer-config');

const ROOT = path.join(__dirname, '..');
const IOS_DIR = path.join(ROOT, 'ios');

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function normalizeStartUrl(startUrl) {
  const parsed = new URL(startUrl);
  let pathname = parsed.pathname;

  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  return parsed.origin + pathname + parsed.search + parsed.hash;
}

function deriveAllowedDomains(startUrl, extraDomains) {
  const hostname = new URL(startUrl).hostname;
  const domains = [hostname];

  if (hostname.endsWith('.github.io') && hostname !== 'github.io') {
    domains.push('github.io');
  }

  const extras = Array.isArray(extraDomains) ? extraDomains : [];
  extras.forEach(function (domain) {
    if (typeof domain === 'string' && domain.trim() && domains.indexOf(domain.trim()) === -1) {
      domains.push(domain.trim());
    }
  });

  return domains;
}

function buildResolvedConfig(config) {
  const startUrl = normalizeStartUrl(config.url.start);
  const extraDomains =
    config.navigation && Array.isArray(config.navigation.allowedDomains)
      ? config.navigation.allowedDomains
      : [];

  return {
    app: config.app,
    url: {
      start: startUrl
    },
    navigation: {
      allowedDomains: deriveAllowedDomains(startUrl, extraDomains)
    },
    webview: config.webview || {},
    branding: config.branding || {}
  };
}

function buildWwwIndexHtml(resolvedConfig) {
  const startUrl = resolvedConfig.url.start;
  const displayName = resolvedConfig.app.displayName;
  const splashBackground = resolvedConfig.branding.splashBackground || '#FFFFFF';
  const offlineTitle = resolvedConfig.branding.offlineTitle || '#757575';

  return '<!DOCTYPE html>\n' +
    '<html lang="fa" dir="rtl">\n' +
    '<head>\n' +
    '    <meta charset="UTF-8">\n' +
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n' +
    '    <title>' + displayName + '</title>\n' +
    '    <style>\n' +
    '        body {\n' +
    '            margin: 0;\n' +
    '            font-family: Tahoma, sans-serif;\n' +
    '            display: flex;\n' +
    '            align-items: center;\n' +
    '            justify-content: center;\n' +
    '            min-height: 100vh;\n' +
    '            background: ' + splashBackground + ';\n' +
    '            color: ' + offlineTitle + ';\n' +
    '        }\n' +
    '    </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '    <p>در حال بارگذاری ' + displayName + '...</p>\n' +
    '    <script>\n' +
    '        (function () {\n' +
    "            var target = '" + startUrl + "';\n" +
    '            var hashIndex = target.indexOf("#");\n' +
    '            var withoutHash = hashIndex === -1 ? target : target.slice(0, hashIndex);\n' +
    '            var hash = hashIndex === -1 ? "" : target.slice(hashIndex);\n' +
    '            var joiner = withoutHash.indexOf("?") === -1 ? "?" : "&";\n' +
    '            var fresh = withoutHash + joiner + "_va=" + Date.now() + hash;\n\n' +
    '            try {\n' +
    '                window.location.replace(fresh);\n' +
    '            } catch (error) {\n' +
    '                window.location.href = fresh;\n' +
    '            }\n' +
    '        })();\n' +
    '    </script>\n' +
    '</body>\n' +
    '</html>\n';
}

function syncCapacitorConfig(resolvedConfig) {
  writeJson(path.join(ROOT, 'capacitor.config.json'), {
    appId: resolvedConfig.app.id,
    appName: resolvedConfig.app.name,
    webDir: 'www',
    server: {
      iosScheme: 'https',
      cleartext: true,
      allowNavigation: resolvedConfig.navigation.allowedDomains
    },
    ios: {
      contentInset: 'automatic'
    }
  });
}

function syncWwwIndex(resolvedConfig) {
  const targetPath = path.join(ROOT, 'www', 'index.html');
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, buildWwwIndexHtml(resolvedConfig), 'utf8');
}

function syncPackageJson(resolvedConfig) {
  const targetPath = path.join(ROOT, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  packageJson.name = resolvedConfig.app.id;
  writeJson(targetPath, packageJson);
}

function syncViewAppConfigAsset(resolvedConfig) {
  const targetPath = path.join(ROOT, 'ios', 'App', 'App', 'viewapp.config.json');
  if (!fs.existsSync(path.dirname(targetPath))) {
    return;
  }

  writeJson(targetPath, resolvedConfig);
}

function main() {
  const config = readDeveloperConfig();
  const resolvedConfig = buildResolvedConfig(config);

  syncCapacitorConfig(resolvedConfig);
  syncWwwIndex(resolvedConfig);
  syncPackageJson(resolvedConfig);
  syncViewAppConfigAsset(resolvedConfig);

  console.log('Synced developerConfigs/viewapp.config.json');
  console.log('App ID: ' + resolvedConfig.app.id);
  console.log('Start URL: ' + resolvedConfig.url.start);
  console.log('Allowed domains: ' + resolvedConfig.navigation.allowedDomains.join(', '));
}

main();
