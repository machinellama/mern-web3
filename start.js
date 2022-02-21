import { execSync } from 'child_process';
import deepForEach  from 'deep-for-each';
import fs  from 'fs';
import fse  from 'fs-extra';
import get  from 'lodash/get';
import path  from 'path';
import stringReplaceAll  from 'string-replace-all';
import chalk from "chalk";

import config from './config';

export function createFiles(options) {
  console.log(chalk.white.bgGreen.bold('Creating files'));

  const directoryName = options?.name || config.package.projectName;
  const both = options?.both || false;
  const includeFront = options?.includeFront || false;
  const includeBack = options?.includeBack || false;
  const frontPort = options?.frontPort || config.webpack.port;
  const backPort = options?.backPort || config.express.port;

  // Create new directory
  const directoryPath = `../${directoryName}`;
  fs.mkdirSync(directoryPath);

  // Copy all files in templates folder to new project directory
  const templatesDirectory = './templates';
  fse.copySync(templatesDirectory, directoryPath);

  // Delete frontend/backend specific files based on flags
  if (both) {
    fs.unlinkSync(`${directoryPath}/package-frontend.json`);
    fs.unlinkSync(`${directoryPath}/package-backend.json`);

    fs.unlinkSync(`${directoryPath}/windows-startup-backend.bat`);
    fs.unlinkSync(`${directoryPath}/windows-startup-frontend.bat`);
  }

  if (includeFront && !includeBack) {
    fs.unlinkSync(`${directoryPath}/package-backend.json`);
    fs.unlinkSync(`${directoryPath}/package.json`);
    fs.renameSync(`${directoryPath}/package-frontend.json`, `${directoryPath}/package.json`);

    fs.unlinkSync(`${directoryPath}/windows-startup-backend.bat`);
    fs.unlinkSync(`${directoryPath}/windows-startup.bat`);
    fs.renameSync(`${directoryPath}/windows-startup-frontend.bat`, `${directoryPath}/windows-startup.bat`);

    fs.rmdirSync(`${directoryPath}/express`, { recursive: true });
    fs.unlinkSync(`${directoryPath}/nodemon.json`);
    fs.unlinkSync(`${directoryPath}/Procfile`);
    fs.unlinkSync(`${directoryPath}/tsoa.json`);
  }

  if (includeBack && !includeFront) {
    fs.unlinkSync(`${directoryPath}/package-frontend.json`);
    fs.unlinkSync(`${directoryPath}/package.json`);
    fs.renameSync(`${directoryPath}/package-backend.json`, `${directoryPath}/package.json`);

    fs.unlinkSync(`${directoryPath}/windows-startup-frontend.bat`);
    fs.unlinkSync(`${directoryPath}/windows-startup.bat`);
    fs.renameSync(`${directoryPath}/windows-startup-backend.bat`, `${directoryPath}/windows-startup.bat`);

    fs.rmdirSync(`${directoryPath}/public`, { recursive: true });
    fs.rmdirSync(`${directoryPath}/src`, { recursive: true });
    fs.unlinkSync(`${directoryPath}/webpack.config.js`);
  }

  console.log('Succesfully copied files to new directory\n');

  // Create a list of all file paths in the new project directory
  const files = [];
  function getFiles(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
      const absolute = path.join(dirPath, file);
      if (fs.statSync(absolute).isDirectory()) {
        return getFiles(absolute);
      }

      return files.push(absolute);
    });
  }
  getFiles(directoryPath);

  // Replace all default values from config file
  files.forEach(file => {
    let fileContent = fs.readFileSync(file, 'utf-8');
    fileContent = replaceDefaults(fileContent);
    fs.writeFileSync(file, fileContent);
  });

  function replaceDefaults(text) {
    let newText = text;
    deepForEach(config, (value, key, subject, path) => {
      let newValue = get(config, path);
      if (path === 'package.projectName') {
        newValue = directoryName;
      }
      if (path === 'webpack.port') {
        newValue = frontPort;
      }
      if (path === 'express.port') {
        newValue = backPort;
      }
      newText = stringReplaceAll(newText, `{{${path}}}`, newValue);
    });

    return newText;
  }

  console.log('Succesfully replaced config defaults\n');
}

function add(names, dev) {
  const EXEC_TIMEOUT = 60 * 1000; // 60 seconds

  names.forEach(name => {
    console.log(chalk.cyan(`Installing ${name}`));
    if (dev) {
      execSync(`yarn add --dev ${name}`, { timeout: EXEC_TIMEOUT });
    } else {
      execSync(`yarn add ${name}`, { timeout: EXEC_TIMEOUT });
    }
  });
}

export function installDependencies(options) {
  console.log(chalk.white.bgGreen.bold('Installing dependencies'));

  const directoryName = options?.name || config.package.projectName;
  const both = options?.both || false;
  const includeFront = options?.includeFront || false;
  const includeBack = options?.includeBack || false;

  const directoryPath = `../${directoryName}`;

  // Install necessary dependencies in new directory
  process.chdir(directoryPath);
  const EXEC_TIMEOUT = 60 * 1000; // 60 seconds

  // Dependencies needed for both frontend and backend
  add([
    'typescript',
    'rimraf',
    'lint-staged@10.5.4',
    'prettier@2.2.1',
    'husky@4',
    'lodash',
    'moment-mini'
  ]);

  if (both) {
    add([
      'copyfiles'
    ], true);
  }

  // Dependencies needed for frontend (React)
  if (includeFront) {
    // dev deps
    add([
      'webpack',
      'webpack-cli',
      'webpack-dev-server',
      '@babel/cli',
      '@babel/core',
      '@babel/node',
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
      '@babel/runtime',
      '@types/react',
      '@types/react-dom',
      'css-loader',
      'file-loader',
      'html-webpack-plugin',
      'mini-css-extract-plugin',
      'sass',
      'sass-loader',
      'style-loader',
      'ts-loader',
      'babel-loader',
      'assert',
      'buffer',
      'crypto-browserify',
      'https-browserify',
      'os-browserify',
      'stream-browserify',
      'stream-http',
      'url',
      'autoprefixer',
      'postcss',
      'postcss-loader',
      'tailwindcss'
    ], true);

    // non-dev deps
    add([
      'react',
      'react-dom',
      'react-router-dom@5.3.0',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      'classnames',
      'http-server',
      'notistack',
      'superagent',
      'regenerator-runtime',
      'use-metamask',
      'web3'
    ]);
  }

  // Dependencies needed for backend (Node/Express)
  if (includeBack) {
    // dev deps
    add([
      '@types/body-parser',
      '@types/express',
      '@types/jest',
      '@types/node',
      'concurrently',
      'core-js@3',
      'jest',
      'nodemon',
      'ts-node'
    ], true);

    // non-dev deps
    add([
      'cors',
      'express',
      'mongodb',
      'jsonwebtoken',
      'swagger-ui-express',
      'tsoa',
      'ethereumjs-util',
      'eth-checksum'
    ]);
  }

  console.log('Succesfully installed dependencies\n');

  if (includeBack) {
    // init express dist for tsoa
    console.log('Initializing dist\n')
    execSync('yarn run build', { timeout: EXEC_TIMEOUT });
  }

  // init git with main branch
  console.log('Initializing git\n')
  execSync('git config --global init.defaultBranch main', { timeout: EXEC_TIMEOUT });
  execSync('git init', { timeout: EXEC_TIMEOUT });

  // initial commit
  execSync('git add .', { timeout: EXEC_TIMEOUT });
  execSync('git commit -m "init"', { timeout: EXEC_TIMEOUT });

  console.log('\n');
  console.log(chalk.white.bgGreen.bold(`Finished initializing ${directoryName}\n`));
}