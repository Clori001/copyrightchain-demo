# CopyrightChain

[English](README.md) | **中文**

![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black) ![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white) ![Solidity 0.8.20](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity&logoColor=white) ![Monad Testnet](https://img.shields.io/badge/Monad-Testnet-836EF9?logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Review_Queue-3FCF8E?logo=supabase&logoColor=white) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

公开网站：https://copyrightchain-public.vercel.app/

CopyrightChain 是一个运行在 Monad Testnet 上的大学 Web3 mini demo，通过部署智能合约，演示数字作品版权登记、审核和公开验证流程。

它演示了如何：

1. 在浏览器本地生成文件 SHA-256 数字指纹。
2. 通过智能合约登记作品信息和文件 Hash。
3. 获得 `CC-000001` 这样的证书编号。
4. 让其他人通过公开页面验证链上记录。

## 产品演示

### 首页与测试网流程

![CopyrightChain Monad Testnet 首页](docs/screenshots/homepage.png)

首页展示版权登记、版权验证入口和 Monad Testnet 运行状态，并明确说明本项目是学习演示原型，不提供法律意义上的版权保护。

### 可验证的链上证书

![CopyrightChain 已验证数字版权证书](docs/screenshots/verified-certificate.png)

审核通过的记录会生成证书页面，展示证书编号、创作者钱包、登记时间、合约地址、交易哈希和在本地生成的文件 SHA-256 数字指纹。访客可以通过验证链接或二维码查看公开测试网记录。

## 重要说明

本应用部署于区块链测试网络，仅用于学习和技术展示。

不涉及真实资产，也不提供法律意义上的版权保护。

## 项目结构

```text
contract/   Solidity 智能合约、Hardhat 测试与部署脚本
frontend/   React + TypeScript + Vite DApp 界面
```

## 合约

```bash
cd contract
npm install
npm run test
```

测试网部署前，创建 `contract/.env`：

```bash
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://testnet-rpc.monad.xyz
CHAIN_ID=10143
NETWORK_NAME=Monad Testnet
```

然后运行：

```bash
npm run deploy:monad
```

部署脚本会更新 `deployment-info.json` 和前端使用的部署信息副本。

## 前端

```bash
cd frontend
npm install
npm run dev
```

可选的 `frontend/.env`：

```bash
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=10143
VITE_NETWORK=Monad Testnet
VITE_RPC_URL=https://testnet-rpc.monad.xyz
VITE_EXPLORER_URL=
VITE_REVIEWER_ADDRESS=0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_PASSWORD_HASH=
```

如果没有配置合约地址，页面仍可打开，但链上写入按钮会禁用并显示部署提示。

## Vercel 部署

Vite 本地域名只在自己的电脑上可用。要公开分享，需要把 `frontend/` 文件夹部署到 Vercel。

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

建议的项目名和公开网址：

```text
copyrightchain-public
https://copyrightchain-public.vercel.app
```

环境变量：

```bash
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=10143
VITE_NETWORK=Monad Testnet
VITE_RPC_URL=https://testnet-rpc.monad.xyz
VITE_EXPLORER_URL=
VITE_REVIEWER_ADDRESS=0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
VITE_SUPABASE_URL=https://eqbdsxhwxbbhgvprmxyi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_cH80mg4w2dykFjeUSUPMtw_wYKFO4aN
VITE_ADMIN_PASSWORD_HASH=
```

公开页面：

```text
/register
/verify
/my-works
/explorer
```

带密码入口的审核中心页面：

```text
https://copyrightchain-public.vercel.app/admin/deploy
https://copyrightchain-public.vercel.app/admin/review
```

审核中心密码只是 demo 级别的轻量访问控制。真正的审核批准仍由审核钱包 MetaMask 保护。如果登记页显示 `Not deployed`，通常不是钱包或网络问题，而是 Vercel 还没有配置合约地址。

从 `/admin/deploy` 部署合约后，把合约地址填入 Vercel 的 `VITE_CONTRACT_ADDRESS` 并重新部署。

## Supabase 公开审核队列

如果朋友需要从自己的设备提交申请，可以使用 Supabase 作为公开审核队列。前端只需要安全的公开值：

```text
Project URL
anon public key
```

不要把 `service_role` key 放进前端。

配置步骤：

1. 创建 Supabase 项目。
2. 打开 Supabase SQL Editor。
3. 运行 `supabase/schema.sql`。
4. 根据 `frontend/.env.example` 创建 `frontend/.env`。
5. 填写公开项目配置：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

完成后，`Submit Without Wallet / 无钱包提交审核` 会进入 Supabase 队列，而不是只存在浏览器本地。审核人可以打开 `/admin/review`，输入审核中心密码，再用 MetaMask 批准、拒绝或隐藏记录。

Supabase Policy 是为了课堂 Demo 故意开放的。生产环境应改为 Supabase Edge Function，并验证审核钱包签名后再允许更新审核结果。

如果数据库表创建于“拒绝/隐藏”功能之前，请重新运行 `supabase/schema.sql`，以启用 `rejected`、`hidden` 状态和 `hidden_certificates` 表。

## 公开部署与审核流程

审核钱包：

```text
0x0Ec53965623c01C8C5a3af8F0d42Bb84cf7b837d
```

1. 打开 `https://copyrightchain-public.vercel.app/admin/deploy`。
2. 输入审核中心密码。
3. 使用审核钱包连接 MetaMask。
4. 点击 `Deploy with MetaMask / 使用 MetaMask 部署` 并确认交易。
5. 把部署出的合约地址写入 Vercel 的 `VITE_CONTRACT_ADDRESS`，然后重新部署。
6. 分享 `https://copyrightchain-public.vercel.app/register`。
7. 用户可以选择：
   - `Use Visitor Wallet / 使用访客自己的钱包`：由 MetaMask、Rabby 等注入式 EVM 钱包提交链上待审核申请。
   - `Submit Without Wallet / 无钱包提交审核`：提交到 Supabase 审核队列。
8. 打开 `/admin/review`，输入审核中心密码，用审核钱包批准、拒绝或隐藏申请。

只有审核通过且未被隐藏的申请会显示为已验证证书。链上记录不可删除，隐藏只影响本网站的公开展示。

本地开发时，在 `frontend/` 中运行 `npm run dev`，然后打开终端显示的 Vite 地址。
