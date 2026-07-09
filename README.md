# CopyrightChain

Public demo / 公开网站: https://copyrightchain-public.vercel.app/

CopyrightChain is a university Web3 mini demo for blockchain-based digital copyright registration on Monad Testnet.

CopyrightChain 是一个运行在 Monad Testnet 上的 Web3 mini demo，通过部署智能合约，用于演示数字作品版权登记、审核和公开验证流程。

It demonstrates how a creator can:

它演示了创作者如何：

1. Generate a SHA-256 file fingerprint locally.
2. Register copyright metadata and the file hash through a smart contract.
3. Receive a certificate ID such as `CC-000001`.
4. Let others verify the record on chain.

中文流程：

1. 在浏览器本地生成文件 SHA-256 数字指纹。
2. 通过智能合约登记作品信息和文件 Hash。
3. 获得 `CC-000001` 这样的证书编号。
4. 让其他人通过公开页面验证链上记录。

## Important Demo Notice / 重要说明

This application is a prototype deployed on a blockchain testnet for educational and demonstration purposes only.

No real assets are involved. This system does not provide legal copyright protection.

本应用部署于区块链测试网络，仅用于学习和技术展示。

不涉及真实资产，也不提供法律意义上的版权保护。

## Structure / 项目结构

```text
contract/   Solidity smart contract, Hardhat tests, deployment script
frontend/   React + TypeScript + Vite DApp interface
```

`contract/` 是 Solidity 合约、Hardhat 测试和部署脚本。

`frontend/` 是 React + TypeScript + Vite 前端应用。

## Contract / 合约

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

部署脚本会更新 `deployment-info.json` 和前端使用的部署信息副本。

## Frontend / 前端

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

如果没有配置合约地址，页面仍可打开，但链上写入按钮会禁用并显示部署提示。

## Vercel Deployment / Vercel 部署

The Vite dev URL only works on your own computer. To share the app with friends, deploy the `frontend/` folder to Vercel.

Vite 本地域名只在自己的电脑上可用。要公开给朋友使用，需要把 `frontend/` 部署到 Vercel。

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

公开页面包括登记、验证、我的作品和发现页。

Password-gated admin pages on the same site:

```text
https://copyrightchain-public.vercel.app/admin/deploy
https://copyrightchain-public.vercel.app/admin/review
```

The admin password gate is only a lightweight demo barrier. Real approval is still protected by the reviewer MetaMask wallet. If the Register page shows `Not deployed`, the wallet/network is not the problem; the public Vercel app still needs a contract address.

Deploy the smart contract from `https://copyrightchain-public.vercel.app/admin/deploy`, then add the deployed address to `VITE_CONTRACT_ADDRESS` in Vercel and redeploy.

后台密码只是 demo 级别的轻量访问控制。真正的审核批准仍由审核钱包 MetaMask 保护。如果登记页显示 `Not deployed`，通常不是钱包或网络问题，而是 Vercel 还没有配置合约地址。

从 `https://copyrightchain-public.vercel.app/admin/deploy` 部署合约后，把合约地址填入 Vercel 的 `VITE_CONTRACT_ADDRESS` 并重新部署。

## Supabase Public Review Queue / Supabase 公开审核队列

Use Supabase when friends need to submit applications from their own devices.

如果朋友需要从自己的设备提交无钱包申请，就使用 Supabase 作为公开审核队列。

You only need frontend-safe values:

```text
Project URL
anon public key
```

Do not put a `service_role` key in the frontend.

不要把 `service_role` key 放进前端。

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

完成后，`Submit Without Wallet / 无钱包提交审核` 会进入 Supabase 队列，而不是只存在浏览器本地。审核人可以打开 `/admin/review`，输入后台密码，再用审核钱包批准或拒绝申请。

The included Supabase policies are intentionally public for a university demo. For production, move approval updates behind a Supabase Edge Function that verifies a reviewer MetaMask signature.

Supabase policy 是为了课堂 demo 故意开放的。生产环境应改为 Supabase Edge Function，并验证审核钱包签名后再允许更新审核结果。

If you already created the Supabase table before the reject feature was added, run `supabase/schema.sql` again in the Supabase SQL Editor so the `rejected` status is allowed.

如果你是在加入“拒绝”按钮前创建的 Supabase 表，请在 Supabase SQL Editor 里重新运行 `supabase/schema.sql`，这样数据库才允许 `rejected / 已拒绝` 状态。

## Public Deployment + Review Flow / 公开部署与审核流程

Reviewer wallet:

```text
0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
```

Use the same Vercel site for public use and password-gated admin access:

```text
Site: https://copyrightchain-public.vercel.app
```

1. Open `https://copyrightchain-public.vercel.app/admin/deploy`.
2. Enter the admin password.
3. Connect MetaMask with the reviewer wallet.
4. Click `Deploy with MetaMask` and approve the deployment transaction.
5. Copy the deployed contract address into `VITE_CONTRACT_ADDRESS` in Vercel, then redeploy.
6. Share `https://copyrightchain-public.vercel.app/register`.
7. Users can choose:
   - `Use Visitor MetaMask`: submit an on-chain pending application from the visitor wallet.
   - `Submit Without Wallet`: submit a pending application to the Supabase review queue.
8. Open `https://copyrightchain-public.vercel.app/admin/review`, enter the admin password, and approve applications with the reviewer wallet.

Only approved applications are shown as verified certificates.

中文流程：

1. 打开 `https://copyrightchain-public.vercel.app/admin/deploy`。
2. 输入后台密码。
3. 使用审核钱包连接 MetaMask。
4. 点击 `Deploy with MetaMask / 使用 MetaMask 部署` 并确认交易。
5. 把部署出的合约地址写入 Vercel 的 `VITE_CONTRACT_ADDRESS`，然后重新部署。
6. 分享 `https://copyrightchain-public.vercel.app/register`。
7. 用户可以选择：
   - `Use Visitor MetaMask / 使用访客自己的 MetaMask`：由访客钱包提交链上待审核申请。
   - `Submit Without Wallet / 无钱包提交审核`：提交到 Supabase 审核队列。
8. 打开 `https://copyrightchain-public.vercel.app/admin/review`，输入后台密码，用审核钱包批准或拒绝申请。

只有审核通过的申请会显示为已验证证书。

For local development, run `npm run dev` in `frontend/` and open the Vite dev URL printed in the terminal.

本地开发时，在 `frontend/` 中运行 `npm run dev`，然后打开终端显示的 Vite 地址。
