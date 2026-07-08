# CopyrightChain

CopyrightChain is a university Web3 mini demo for blockchain-based digital copyright registration.

It demonstrates how a creator can:

1. Generate a SHA-256 file fingerprint locally.
2. Register copyright metadata and the file hash through a smart contract.
3. Receive a certificate ID such as `CC-000001`.
4. Let others verify the record on chain.

## Important Demo Notice

This application is a prototype deployed on a blockchain testnet for educational and demonstration purposes only.

No real assets are involved. This system does not provide legal copyright protection.

本应用部署于区块链测试网络，仅用于学习和技术展示。

不涉及真实资产，也不提供法律意义上的版权保护。

## Structure

```text
contract/   Solidity smart contract, Hardhat tests, deployment script
frontend/   React + TypeScript + Vite DApp interface
```

## Contract

```bash
cd contract
npm install
npm run test
```

For testnet deployment, create `contract/.env`:

```bash
PRIVATE_KEY=your_wallet_private_key
RPC_URL=your_testnet_rpc
CHAIN_ID=10143
NETWORK_NAME=Monad Testnet
```

Then run:

```bash
npm run deploy:monad
```

The deployment script updates `deployment-info.json` and the frontend deployment copy.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional `frontend/.env`:

```bash
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=10143
VITE_NETWORK=Monad Testnet
VITE_RPC_URL=
VITE_EXPLORER_URL=
VITE_REVIEWER_ADDRESS=0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ENABLE_ADMIN=false
```

If no contract address is configured, the UI still renders but chain write actions are disabled with a deployment notice.

## Public Domain Deployment

The local URL `http://localhost:5173` only works on your own computer. To share the app with friends, deploy the `frontend/` folder to Vercel.

Vercel settings:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Environment variables to add in Vercel:

```bash
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=10143
VITE_NETWORK=Monad Testnet
VITE_RPC_URL=
VITE_EXPLORER_URL=
VITE_REVIEWER_ADDRESS=0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
VITE_SUPABASE_URL=https://eqbdsxhwxbbhgvprmxyi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_cH80mg4w2dykFjeUSUPMtw_wYKFO4aN
VITE_ENABLE_ADMIN=false
```

After the smart contract is deployed, add its address to `VITE_CONTRACT_ADDRESS` and redeploy so public users can verify certificates.

Public pages:

```text
/register
/verify
/my-works
/explorer
```

Create a second private admin deployment from the same `frontend/` folder if you want deploy/review on a separate site. Use the same Vercel settings, but set:

```bash
VITE_ENABLE_ADMIN=true
```

Admin-only URLs on that private deployment:

```text
/admin/deploy
/admin/review
```

## Supabase Public Review Queue

Use Supabase when friends need to submit applications from their own devices.

You only need frontend-safe values:

```text
Project URL
anon public key
```

Do not put a `service_role` key in the frontend.

Setup:

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Create `frontend/.env` from `frontend/.env.example`.
5. Fill:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

After this, `Use Website Wallet` submissions go to Supabase instead of browser-only local storage. The reviewer can open `/admin/review` and approve them with MetaMask.

The included Supabase policies are intentionally public for a university demo. For production, move approval updates behind a Supabase Edge Function that verifies a reviewer MetaMask signature.

## MetaMask Deployment + Review Flow

Reviewer wallet:

```text
0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
```

1. Open `http://localhost:5173/admin/deploy`.
2. Connect MetaMask with the reviewer wallet.
3. Click `Deploy with MetaMask` and approve the deployment transaction.
4. The deployed contract address is saved in browser local storage.
5. Open `http://localhost:5173/register`.
6. Users can choose:
   - `Bind MetaMask Wallet`: submit an on-chain pending application.
   - `Use Website Wallet`: save a local pending application for reviewer approval.
7. Open `http://localhost:5173/admin/review` with the reviewer wallet to approve applications.

Only approved applications are shown as verified certificates.
