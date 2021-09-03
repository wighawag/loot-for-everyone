#!/usr/bin/env node
'use strict';
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const {spawn} = require('child_process');

const commandlineArgs = process.argv.slice(2);

function wait(numSeconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, numSeconds * 1000);
  });
}

function parseArgs(rawArgs, numFixedArgs, expectedOptions) {
  const fixedArgs = [];
  const options = {};
  const extra = [];
  const alreadyCounted = {};
  for (let i = 0; i < rawArgs.length; i++) {
    const rawArg = rawArgs[i];
    if (rawArg.startsWith('--')) {
      const optionName = rawArg.slice(2);
      const optionDetected = expectedOptions[optionName];
      if (!alreadyCounted[optionName] && optionDetected) {
        alreadyCounted[optionName] = true;
        if (optionDetected === 'boolean') {
          options[optionName] = true;
        } else {
          i++;
          options[optionName] = rawArgs[i];
        }
      } else {
        if (fixedArgs.length < numFixedArgs) {
          throw new Error(`expected ${numFixedArgs} fixed args, got only ${fixedArgs.length}`);
        } else {
          extra.push(rawArg);
        }
      }
    } else {
      if (fixedArgs.length < numFixedArgs) {
        fixedArgs.push(rawArg);
      } else {
        for (const opt of Object.keys(expectedOptions)) {
          alreadyCounted[opt] = true;
        }
        extra.push(rawArg);
      }
    }
  }
  return {options, extra, fixedArgs};
}

function execute(command) {
  return new Promise((resolve, reject) => {
    const onExit = (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    };
    spawn(command.split(' ')[0], command.split(' ').slice(1), {
      stdio: 'inherit',
      shell: true,
    }).on('exit', onExit);
  });
}

function getEnv(network) {
  let env = 'dotenv -e .env -e contracts/.env -- ';
  if (network && network !== 'localhost') {
    env = `dotenv -e .env.${network} -e .env -e contracts/.env -- `;
  }
  return env;
}

async function performAction(rawArgs) {
  const firstArg = rawArgs[0];
  const args = rawArgs.slice(1);
  // console.log({firstArg, args});
  if (firstArg == 'contracts:dev') {
    const {fixedArgs, extra, options} = parseArgs(args, 0, {reset: 'boolean'});
    if (options.reset) {
      await execute('rimraf contracts/deployments/localhost && rimraf web/src/lib/contracts.json');
    }
    // await execute(`wait-on tcp:localhost:8545`);
    // await wait(1); // slight delay to ensure ethereum node is actually ready
    await execute(
      `dotenv -e .env -e contracts/.env -- npm --prefix contracts run dev -- --export ../web/src/lib/contracts.json`
    );
  } else if (firstArg === 'contracts:deploy') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0] || 'localhost';
    const env = getEnv(network);
    await execute(
      `${env}npm --prefix contracts run deploy ${network} -- --export ../web/src/lib/contracts.json ${extra.join(' ')}`
    );
  } else if (firstArg === 'contracts:export') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0];
    if (!network) {
      console.error(`need to specify the network as first argument`);
      return;
    }
    const env = getEnv(network);
    await execute(`${env}npm --prefix contracts run export ${network} -- ../web/src/lib/contracts.json`);
  } else if (firstArg === 'contracts:seed') {
    const {fixedArgs, extra, options} = parseArgs(args, 1, {waitContracts: 'boolean'});
    const network = fixedArgs[0] || 'localhost';
    const env = getEnv(network);
    if (options.waitContracts) {
      console.log(`waiting for web/src/lib/contracts.json...`);
      await execute(`wait-on web/src/lib/contracts.json`);
    }
    await execute(`${env}npm --prefix contracts run execute ${network} scripts/seed.ts ${extra.join(' ')}`);
  } else if (firstArg === 'contracts:execute') {
    const {fixedArgs, extra, options} = parseArgs(args, 1, {waitContracts: 'boolean'});
    const network = fixedArgs[0] || 'localhost';
    const env = getEnv(network);
    if (options.waitContracts) {
      console.log(`waiting for web/src/lib/contracts.json...`);
      await execute(`wait-on web/src/lib/contracts.json`);
    }
    await execute(`${env}npm --prefix contracts run execute ${network} ${extra.join(' ')}`);
  } else if (firstArg === 'web:dev') {
    const {fixedArgs, options} = parseArgs(args, 1, {skipContracts: 'boolean'});
    const network = fixedArgs[0] || 'localhost';
    if (!options.skipContracts) {
      await performAction(['contracts:export', network]);
    }
    const env = getEnv(network);
    await execute(`${env}npm --prefix web run dev`);
  } else if (firstArg === 'web:build') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0] || process.env.NETWORK_NAME || 'localhost';
    const env = getEnv(network);
    await execute(`${env}npm --prefix web run prepare`);
    await performAction(['contracts:export', network || 'localhost']);
    await execute(`${env}npm run common:build`);
    await execute(`${env}npm --prefix web run build`);
  } else if (firstArg === 'web:serve') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0];
    const env = getEnv(network);
    await execute(`${env}npm --prefix web run serve`);
  } else if (firstArg === 'web:build:serve') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0] || 'localhost';
    await performAction(['web:build', network || 'localhost']);
    await performAction(['web:serve', network || 'localhost']);
  } else if (firstArg === 'web:deploy') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0];
    if (!network) {
      console.error(`need to specify the network as first argument`);
      return;
    }
    const env = getEnv(network);
    await performAction(['web:build', network]);
    await execute(`${env}npm --prefix web run deploy`);
  } else if (firstArg === 'deploy') {
    //run-s staging:contracts web:prepare common:build staging:web:rebuild staging:web:deploy
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0] || process.env.NETWORK_NAME;
    if (!network) {
      console.error(`need to specify the network as first argument (or via env: NETWORK_NAME)`);
      return;
    }
    await performAction(['contracts:deploy', network]);
    await performAction(['web:deploy', network]);
  } else if (firstArg === 'stop') {
  } else if (firstArg === 'dev') {
    execute(`newsh "npm run common:dev"`);
    execute(`newsh "npm run web:dev -- --skipContracts"`);
    execute(`newsh "npm run contracts:dev -- --reset"`);
    await performAction(['common:build']);
    await performAction(['contracts:seed', 'localhost', '--waitContracts']);
  } else if (firstArg === 'start') {
    execute(`newsh "npm run common:dev"`);
    execute(`newsh "npm run web:dev -- --skipContracts"`);
    execute(`newsh "npm run contracts:dev -- --reset"`);
    await performAction(['common:build']);
    await performAction(['contracts:seed', 'localhost', '--waitContracts']);
  }
}

performAction(commandlineArgs);
