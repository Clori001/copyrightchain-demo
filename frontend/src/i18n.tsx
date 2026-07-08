import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Language = "en" | "zh";

type Dictionary = Record<string, { en: string; zh: string }>;

const dictionary: Dictionary = {
  home: { en: "Home", zh: "首页" },
  register: { en: "Register Copyright", zh: "登记版权" },
  myWorks: { en: "My Works", zh: "我的作品" },
  verify: { en: "Verify Copyright", zh: "验证版权" },
  explorer: { en: "Explorer", zh: "浏览器" },
  review: { en: "Review", zh: "审核" },
  deploy: { en: "Deploy", zh: "部署" },
  connectWallet: { en: "Connect Wallet", zh: "连接钱包" },
  walletNotConnected: { en: "Wallet Not Connected", zh: "钱包未连接" },
  wrongNetwork: { en: "Wrong Network", zh: "网络错误" },
  switchNetwork: { en: "Switch Network", zh: "切换网络" },
  demoVersion: { en: "Demo Version", zh: "测试版本" },
  demoNoticeShort: {
    en: "This application runs on a blockchain testnet. No real assets are involved.",
    zh: "本应用运行于区块链测试网络，不涉及真实资产。"
  },
  educationalOnly: { en: "Educational Demo Only", zh: "仅用于学习展示" },
  network: { en: "Network", zh: "网络" },
  contractStatus: { en: "Contract Status", zh: "合约状态" },
  active: { en: "Active", zh: "运行中" },
  notDeployed: { en: "Not deployed", zh: "未部署" },
  registeredWorks: { en: "Registered Works", zh: "登记作品数量" },
  creators: { en: "Creators", zh: "创作者数量" },
  totalWorks: { en: "Total Works", zh: "作品总数" },
  latestRegistration: { en: "Latest Registration", zh: "最新登记" },
  blockchainOverview: { en: "Blockchain Overview", zh: "区块链状态" },
  howItWorks: { en: "How It Works", zh: "工作流程" },
  uploadWork: { en: "Upload Your Work", zh: "上传作品" },
  uploadDescription: { en: "Select your digital file.", zh: "选择你的数字作品。" },
  generateFingerprint: { en: "Generate Digital Fingerprint", zh: "生成数字指纹" },
  fingerprintDescription: {
    en: "Your file is converted into a unique hash.",
    zh: "系统为你的文件生成唯一 Hash。"
  },
  registerOnChain: { en: "Register On Chain", zh: "写入区块链" },
  registerOnChainDescription: {
    en: "Smart contract creates an immutable record.",
    zh: "智能合约生成不可修改的登记记录。"
  },
  protectTitle: { en: "Protect Your Digital Creations", zh: "保护你的数字创作" },
  protectDescription: {
    en: "Create a verifiable blockchain record for your digital works.",
    zh: "通过区块链为你的数字作品创建可验证、不可篡改的登记记录。"
  },
  createProof: {
    en: "Create a blockchain-based proof for your digital work.",
    zh: "为你的数字作品创建链上证明。"
  },
  uploadFile: { en: "Upload File", zh: "上传文件" },
  workInformation: { en: "Work Information", zh: "作品信息" },
  blockchainRegistration: { en: "Blockchain Registration", zh: "链上登记" },
  dropFile: { en: "Drag and drop your file here", zh: "拖入你的文件" },
  chooseFile: { en: "Choose File", zh: "选择文件" },
  supportedFormats: {
    en: "Supported formats: JPG, PNG, GIF, MP3, WAV, PDF, DOCX, TXT, ZIP, JSON, etc.",
    zh: "支持格式：JPG、PNG、GIF、MP3、WAV、PDF、DOCX、TXT、ZIP、JSON 等。"
  },
  fileHash: { en: "File Hash", zh: "文件 Hash" },
  hashExplanation: {
    en: "A hash is a unique digital fingerprint generated from your file. Any modification creates a different hash.",
    zh: "Hash 是文件唯一数字指纹。文件内容改变后，Hash 也会改变。"
  },
  workTitle: { en: "Work Title", zh: "作品名称" },
  category: { en: "Category", zh: "分类" },
  selectCategory: { en: "Select a category", zh: "请选择分类" },
  description: { en: "Description", zh: "描述" },
  externalLink: { en: "External Link (Optional)", zh: "外部链接（可选）" },
  registrationPreview: { en: "Registration Preview", zh: "登记预览" },
  confirmTransaction: { en: "Confirm Transaction", zh: "确认交易" },
  confirmTransactionBody: {
    en: "You are about to create a blockchain record on testnet.",
    zh: "你即将在测试网络创建一条链上登记记录。"
  },
  cancel: { en: "Cancel", zh: "取消" },
  confirm: { en: "Confirm", zh: "确认" },
  walletApproval: { en: "Waiting for wallet approval...", zh: "等待钱包确认..." },
  txSubmitted: { en: "Transaction submitted. Waiting for blockchain confirmation...", zh: "交易已提交，等待区块链确认..." },
  registrationCompleted: { en: "Registration Completed", zh: "登记成功" },
  applicationSubmitted: { en: "Application Submitted", zh: "申请已提交" },
  submitApplication: { en: "Submit Application", zh: "提交申请" },
  pendingReview: { en: "Pending Review", zh: "等待审核" },
  approved: { en: "Approved", zh: "审核通过" },
  approve: { en: "Approve", zh: "批准" },
  bindWallet: { en: "Use Visitor MetaMask", zh: "使用访客自己的 MetaMask" },
  bindWalletNote: {
    en: "This only connects the visitor's browser wallet. It does not connect the reviewer wallet.",
    zh: "这只会连接当前访客浏览器里的钱包，不会连接审核钱包。"
  },
  websiteWallet: { en: "Submit Without Wallet", zh: "无钱包提交审核" },
  websiteWalletNote: {
    en: "No MetaMask is needed. The application goes to the review queue, then the reviewer approves it from the admin site.",
    zh: "访客不需要 MetaMask。申请会进入审核队列，之后你在后台用审核钱包批准。"
  },
  deployDescription: {
    en: "Deploy with MetaMask. Your private key stays inside MetaMask and the deployed address is saved in this browser.",
    zh: "使用 MetaMask 部署。你的私钥只保存在 MetaMask 中，部署后的合约地址会保存在当前浏览器。"
  },
  deploymentChecklist: { en: "Deployment Checklist", zh: "部署检查清单" },
  reviewerWallet: { en: "Reviewer Wallet", zh: "审核钱包" },
  connectedWallet: { en: "Connected Wallet", zh: "当前连接钱包" },
  deployWithMetaMask: { en: "Deploy with MetaMask", zh: "使用 MetaMask 部署" },
  deploymentStatus: { en: "Deployment Status", zh: "部署状态" },
  confirmDeployment: { en: "Confirm deployment in MetaMask", zh: "在 MetaMask 中确认部署" },
  waitBlockchain: { en: "Wait for blockchain confirmation", zh: "等待区块链确认" },
  saveContractLocal: { en: "Save contract address locally", zh: "保存合约地址到本地浏览器" },
  deploymentHistory: { en: "Local Deployment History", zh: "本地部署历史" },
  wrongReviewerWallet: { en: "Please switch MetaMask to the reviewer wallet before deployment.", zh: "请先在 MetaMask 切换到审核钱包后再部署。" },
  deployed: { en: "Deployed", zh: "部署成功" },
  refreshAfterDeploy: { en: "Refresh the page once if other pages still show Not deployed.", zh: "如果其他页面仍显示未部署，请刷新页面一次。" },
  reviewCenter: { en: "Review Center", zh: "审核中心" },
  reviewerOnly: { en: "Only the reviewer wallet can approve applications.", zh: "只有审核钱包可以批准申请。" },
  connectReviewerWallet: { en: "Connect the reviewer MetaMask wallet first.", zh: "请先连接审核用的 MetaMask 钱包。" },
  contractNotDeployedReview: { en: "Contract is not deployed yet. Deploy it before approving applications.", zh: "合约还没有部署。请先部署合约，再审核申请。" },
  onchainPendingApplications: { en: "On-chain Pending Applications", zh: "链上待审核申请" },
  localApplications: { en: "Local Applications", zh: "本地申请" },
  noOnchainPending: { en: "No on-chain applications are waiting for review.", zh: "暂无链上待审核申请。" },
  noLocalPending: { en: "No local website-wallet applications are waiting for review.", zh: "暂无网站钱包本地待审核申请。" },
  approveAndRegister: { en: "Approve & Register On Chain", zh: "批准并写入链上" },
  certificateId: { en: "Certificate ID", zh: "版权编号" },
  transactionHash: { en: "Transaction Hash", zh: "链上交易编号" },
  viewCertificate: { en: "View Certificate", zh: "查看证明" },
  digitalCertificate: { en: "Digital Copyright Certificate", zh: "数字版权登记证明" },
  verifiedOnChain: { en: "VERIFIED ON CHAIN", zh: "链上验证通过" },
  verifyOnChain: { en: "Verify On Chain", zh: "链上验证" },
  copyrightInformation: { en: "Copyright Information", zh: "版权信息" },
  blockchainProof: { en: "Blockchain Proof", zh: "链上证明" },
  creator: { en: "Creator", zh: "创作者" },
  registeredDate: { en: "Registered Date", zh: "登记时间" },
  smartContract: { en: "Smart Contract", zh: "智能合约" },
  copyCertificateLink: { en: "Copy Certificate Link", zh: "复制证明链接" },
  scanToVerify: { en: "Scan to verify this certificate", zh: "扫描验证该证明" },
  certificateNotFound: { en: "Certificate Not Found", zh: "未找到版权证明" },
  noBlockchainRecord: { en: "No blockchain record exists for this ID.", zh: "该编号不存在链上记录。" },
  myRecords: { en: "My Copyright Records", zh: "我的版权记录" },
  myRecordsSubtitle: {
    en: "View all copyright registrations created by your wallet.",
    zh: "查看你的钱包创建的所有版权登记。"
  },
  noRecords: { en: "No copyright records yet.", zh: "暂无版权记录。" },
  startFirst: { en: "Start your first registration.", zh: "创建你的第一个登记。" },
  refresh: { en: "Refresh", zh: "刷新" },
  loadingRecords: { en: "Loading your blockchain records...", zh: "正在读取链上记录..." },
  verifyDescription: {
    en: "Verify whether a copyright certificate exists on blockchain.",
    zh: "验证版权证明是否真实存在于区块链。"
  },
  verified: { en: "Verified", zh: "验证成功" },
  noRecordFound: { en: "No Record Found", zh: "未找到记录" },
  noRecordFoundBody: { en: "This certificate ID does not exist.", zh: "该版权编号不存在。" },
  viewExplorer: { en: "View on Explorer", zh: "在浏览器查看" },
  explorerDescription: {
    en: "Explore copyright registration records on the blockchain.",
    zh: "浏览区块链上的版权登记记录。"
  },
  contractInformation: { en: "Contract Information", zh: "合约信息" },
  contractName: { en: "Contract Name", zh: "合约名称" },
  contractAddress: { en: "Contract Address", zh: "合约地址" },
  latestRegistrations: { en: "Latest Registrations", zh: "最新登记记录" },
  timestamp: { en: "Timestamp", zh: "时间戳" },
  transaction: { en: "Transaction", zh: "交易" }
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof dictionary) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("copyrightchain:language") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("copyrightchain:language", language);
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: keyof typeof dictionary) => dictionary[key]?.[language] || key
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useTranslation must be used inside LanguageProvider");
  }

  return context;
}
