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
VITE_ADMIN_PASSWORD_HASH=
```

If no contract address is configured, the UI still renders but chain write actions are disabled with a deployment notice.

## Vercel Deployment

The Vite dev URL only works on your own computer. To share the app with friends, deploy the `frontend/` folder to Vercel.

Vercel settings:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Recommended project name:

```text
copyrightchain-public
```

Public URL example:

```text
https://copyrightchain-public.vercel.app
```

Environment variables:

```bash
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=10143
VITE_NETWORK=Monad Testnet
VITE_RPC_URL=
VITE_EXPLORER_URL=
VITE_REVIEWER_ADDRESS=0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
VITE_SUPABASE_URL=https://eqbdsxhwxbbhgvprmxyi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_cH80mg4w2dykFjeUSUPMtw_wYKFO4aN
VITE_ADMIN_PASSWORD_HASH=
```

Public pages:

```text
/register
/verify
/my-works
/explorer
```

Password-gated admin pages on the same site:

```text
/admin/deploy
/admin/review
```

The admin password gate is only a lightweight demo barrier. Real approval is still protected by the reviewer MetaMask wallet. After the smart contract is deployed from `/admin/deploy`, add its address to `VITE_CONTRACT_ADDRESS` in Vercel and redeploy.

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

After this, `Submit Without Wallet` submissions go to Supabase instead of browser-only storage. The reviewer can open `/admin/review`, enter the admin password, and approve them with MetaMask.

The included Supabase policies are intentionally public for a university demo. For production, move approval updates behind a Supabase Edge Function that verifies a reviewer MetaMask signature.

## Public Deployment + Review Flow

Reviewer wallet:

```text
0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
```

Use the same Vercel site for public use and password-gated admin access:

```text
Site: https://your-domain.vercel.app
```

1. Open `https://your-domain.vercel.app/admin/deploy`.
2. Enter the admin password.
3. Connect MetaMask with the reviewer wallet.
4. Click `Deploy with MetaMask` and approve the deployment transaction.
5. Copy the deployed contract address into `VITE_CONTRACT_ADDRESS` in Vercel, then redeploy.
6. Share `https://your-domain.vercel.app/register`.
7. Users can choose:
   - `Use Visitor MetaMask`: submit an on-chain pending application from the visitor wallet.
   - `Submit Without Wallet`: submit a pending application to the Supabase review queue.
8. Open `https://your-domain.vercel.app/admin/review`, enter the admin password, and approve applications with the reviewer wallet.

Only approved applications are shown as verified certificates.

For local development, run `npm run dev` in `frontend/` and open the Vite dev URL printed in the terminal.
