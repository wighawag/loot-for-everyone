<!--- -------------------------------------------- -->

# Loot For Everyone

This is a template to build a decentralised applicaiton using ethereum, hardhat and svelte

to make an app out of it, execute the following

```
npx degit wighawag/loot-for-everyone <your-app-folder>
```

There also more templates available in branches:

## NFT version (it includes eip-721-subgraph and a basic "my nfts" page):

```
npx degit wighawag/loot-for-everyone#nft <your-app-folder>
```

---

<br/>
<br/>
<!--- -------------------------------------------- -->

# App Setup

## requirements :

This app requires [node.js](https://nodejs.org/) (tested on v12+)

### pnpm

This repo use `pnpm` for package management : https://pnpm.js.org

```bash
npx pnpm add -g pnpm
```

`pnpm` is used because it has the best mono-repo support which this project relies on.
You might be able to switch to `yarn` but will most likely have to configure it to fix hoisting issues.
If you decide to use `yarn` you ll have to remove the script "preinstall" that by default force the use of `pnpm`

## intall dependencies :

```bash
pnpm run setup
```

This will set the app name (and change the files to reflect that) and then call `pnpm install`

You can also manually set the name yourself :

```bash
pnpm set-name [<new name>] && pnpm install
```

# Development

The following command will start everything up.

```bash
pnpm start
```

This will run each processes in their own terminal window/tab. Note that you might need configuration based on your system.

On linux it uses `xterm` by default (so you need that installed).

On windows it use `cmd.exe` by default.

If you need some other terminal to execute the separate processes, you can configure it in `.newsh.json`.

This command will bring 5 shells up

2. common-lib: watching for changes and recompiling to js.
3. web app: watching for changes. Hot Module Replacement enabled. (will reload on common-lib changes)
4. contracts: watching for changes. For every code changes, contract are redeployed, with proxies keeping their addresses.

# full list of commands

Here is the list of npm scripts you can execute:

Some of them relies on [./\_scripts.js](./_scripts.js) to allow parameterizing it via command line argument (have a look inside if you need modifications)
<br/><br/>

`pnpm prepare`

As a standard lifecycle npm script, it is executed automatically upon install. It generate various config file for you, including vscode files.
<br/><br/>

`pnpm setup`

this will update name of the project (by default "loot-for-everyone") to be the name of the folder (See `set-name` command) and install the dependencies (`pnpm install`)
<br/><br/>

`pnpm set-name [<new name>]`

This will replace every instance of `loot-for-everyone` (or whatever name was set) to `new name` (if specified, otherwise it use the folder name)
If your name is not unique and conflict with variable name, etc... this will not be safe to execute.
<br/><br/>

`pnpm common:dev`

This will compile the common-library and watch for changes.
<br/><br/>

`pnpm common:build`

This will compile the common library and terminate
<br/><br/>

`pnpm contracts:dev`

This will deploy the contract on localhost and watch for changes and recompile/redeploy when so.
<br/><br/>

`pnpm contracts:deploy [<network>]`

This will deploy the contract on the network specified.

If network is a live network, a mnemonic and url will be required. the following env need to be set:

- `MNEMONIC_<network name>`
- `ETH_NODE_URI_<network name>`
  <br/><br/>

`pnpm web:dev [<network>]`

This will spawn a vite dev server for the webapp, connected to the specified network
<br/><br/>

`pnpm web:build [<network>]`

This will build a static version of the web app for the specified network.
<br/><br/>

`pnpm web:serve`

This will serve the static file as if on an ipfs gateway.
<br/><br/>

`pnpm web:build:serve [<network>]`

this both build and serve the web app.
<br/><br/>

`pnpm web:deploy <network>`

This build and deploy the web app on ipfs for the network specified.

You ll need the following env variables setup :

- `IPFS_DEPLOY_PINATA__API_KEY` │
- `IPFS_DEPLOY_PINATA__SECRET_API_KEY`

<br/><br/>

`pnpm deploy [<network>]`

This will deploy all (contracts and web app). See below for more details.

If no network are specified it will fetch from the env variable `NETWORK_NAME`.
<br/><br/>

`pnpm stop`

This stop the docker services running
<br/><br/>

`pnpm externals`
This spawn docker services: an ethereum node
<br/><br/>

`pnpm dev`
This assume external service run. It will spawn a web server, watch/build the common library, the web app, the contracts.
<br/><br/>

`pnpm start`
It will spawn everything needed to get started, external services, a web server, watch/build the common library, the web app, the contracts.
<br/><br/>

# env variables required for full deployment

You need to gather the following environment variables :

- `INFURA_TOKEN=<infura token to talk to a network>`
- `IPFS_DEPLOY_PINATA__API_KEY=<pinata api key>`
- `IPFS_DEPLOY_PINATA__SECRET_API_KEY=<pinata secret key>`
- `MNEMONIC=<mnemonic of the account that will deploy the contract>` (you can also use `MNEMONIC_<network name>`)

Note that pinata is currently the default ipfs provider setup but ipfs-deploy, the tool used to deploy to ipfs support other providers, see : https://github.com/ipfs-shipyard/ipfs-deploy

For production and staging, you would need to set MENMONIC too in the respective `.env.production` and `.env.staging` files.

You can remove the env if you want to use the same as the one in `.env`

You'll also need to update the following for staging and production :

- `VITE_CHAIN_ID=<id of the chain where contracts lives>`

Furthermore, you need to ensure the values in [web/application.json](web/application.json) are to your liking. Similar for the the web/public/preview.png image that is used for open graph metadata. The application.json is also where you setup the ens name if any.

# fleek github integration

For `web:build` you can also use [fleek](https://fleek.co) so that building and ipfs deployment is done automatically. The repo provide a `.fleek.json` file already setup for staging.

The only thing needed is setting up the environment variables (VITE_THE_GRAPH_HTTP, VITE_CHAIN_ID). You can either set them in fleek dashboard or set them in `.fleek.json`
