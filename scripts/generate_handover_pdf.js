import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const MAROON = [55, 6, 23];      // #370617
const GOLD = [184, 138, 68];     // #B88A44
const DARK_GRAY = [32, 26, 27];  // #201a1b
const LIGHT_BG = [250, 246, 240];// #FAF6F0
const GREEN = [31, 122, 82];     // #1F7A52

let y = 15;

function checkPageBreak(requiredHeight = 20) {
  if (y + requiredHeight > 275) {
    doc.addPage();
    y = 20;
    // Add running header
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('Kavitha Jewellery — Developer Technical Handover Documentation', 14, 10);
    doc.text(`Page ${doc.getNumberOfPages()}`, 196, 10, { align: 'right' });
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 12, 196, 12);
  }
}

// ---------------- HEADER BANNER ----------------
doc.setFillColor(...MAROON);
doc.rect(14, y, 182, 32, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.text('KAVITHA JEWELLERY', 20, y + 12);

doc.setFontSize(10.5);
doc.setTextColor(...GOLD);
doc.text('DEVELOPER TECHNICAL HANDOVER & ARCHITECTURE SPECIFICATION', 20, y + 20);

doc.setFontSize(8);
doc.setTextColor(230, 230, 230);
doc.setFont('helvetica', 'normal');
doc.text('Version 1.0  |  Kerala 22K Gold Retail & Onam Campaign Platform  |  Confidential Developer Brief', 20, y + 26);

y += 38;

// ---------------- 1. EXECUTIVE SUMMARY & TECH STACK ----------------
checkPageBreak(30);
doc.setFillColor(...LIGHT_BG);
doc.rect(14, y, 182, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...MAROON);
doc.text('1. PROJECT SUMMARY & TECH STACK', 18, y + 5);
y += 11;

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(...DARK_GRAY);
const summaryText = 
  'Kavitha Jewellery is a responsive, high-performance web application designed for a luxury 22K Gold & Diamond retail brand in Kerala. It combines an e-commerce catalog with a Live Gold Rate Price Breakdown Engine, a gamified Onam Campaign Voucher System with BSNL DLT OTP Verification, an In-Store Staff Redemption POS Terminal, and a Protected Admin Portal.';
const splitSummary = doc.splitTextToSize(summaryText, 180);
doc.text(splitSummary, 15, y);
y += (splitSummary.length * 4.5) + 3;

// Tech Stack Table
autoTable(doc, {
  startY: y,
  margin: { left: 14, right: 14 },
  head: [['Component', 'Technology & Library', 'Role / Purpose']],
  body: [
    ['Frontend Framework', 'React 19 + TypeScript (Strict)', 'Core reactive UI and state architecture'],
    ['Build System', 'Vite 6 (@tailwindcss/vite)', 'Ultra-fast HMR and production bundle bundling'],
    ['Styling & Design', 'Tailwind CSS v4 + Playfair / Inter', 'Kerala luxury brand aesthetic with custom color palette'],
    ['Animation & Polish', 'Motion (motion/react)', 'Smooth wheel spins, modals, toasts, tab transitions'],
    ['Icons', 'Google Material Symbols + Lucide', 'E-commerce, hallmark, security, and retail icons'],
    ['Deployment Target', 'Cloud Run / Static Container (Port 3000)', 'Zero-config Node / SPA runtime container environment']
  ],
  headStyles: { fillColor: MAROON, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: DARK_GRAY, cellPadding: 2 },
  theme: 'grid',
});

y = doc.lastAutoTable.finalY + 8;

// ---------------- 2. ARCHITECTURE & VIEWS ----------------
checkPageBreak(40);
doc.setFillColor(...LIGHT_BG);
doc.rect(14, y, 182, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...MAROON);
doc.text('2. APPLICATION VIEWS & USER JOURNEYS', 18, y + 5);
y += 11;

autoTable(doc, {
  startY: y,
  margin: { left: 14, right: 14 },
  head: [['View File', 'Primary Responsibilities & Functional Features']],
  body: [
    ['HomeView.tsx', 'Hero banners, Live Gold Rate Ticker, Featured Collections, Trust Badges (BIS 916, 100% Exchange).'],
    ['CatalogView.tsx', 'Filterable catalog with Purity (22K/18K/14K), Weight Range, Category tabs, Price Range, and Instant Search.'],
    ['PdpView.tsx', 'Dynamic Price Breakdown Engine: (Gold Weight × Current Rate) + Making Charges + Wastage + Hallmarking + 3% GST. Includes Customer 5-Star Reviews & WhatsApp concierge.'],
    ['CartView.tsx', 'Live synchronized shopping cart, gift notes, and BSNL DLT OTP verified checkout modal (CheckoutOtpModal.tsx).'],
    ['OnamCampaignView.tsx', 'Gamified Lucky Gold Wheel with fraud-resistant OTP verification and instant voucher issuance.'],
    ['StaffRedemptionView.tsx', 'In-Store POS Terminal: Phone lookup, voucher status verification, making charge discount rules, and mark as REDEEMED.'],
    ['AdminCampaignView.tsx', 'Protected Admin Management: Real-time Gold Rate editor, Quota Pool Manager, DLT SMS Config, VIP Voucher Generator, Margin Simulator.']
  ],
  headStyles: { fillColor: GOLD, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: DARK_GRAY, cellPadding: 2.2 },
  columnStyles: { 0: { cellWidth: 42, fontStyle: 'bold' } },
  theme: 'grid',
});

y = doc.lastAutoTable.finalY + 8;

// ---------------- 3. DATABASE & STORAGE LAYER ----------------
checkPageBreak(35);
doc.setFillColor(...LIGHT_BG);
doc.rect(14, y, 182, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...MAROON);
doc.text('3. DATA PERSISTENCE & STORAGE KEYS', 18, y + 5);
y += 11;

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...DARK_GRAY);
const storageIntro = 'All state currently operates out-of-the-box using structured browser persistence. Developers can replace these modular stores with PostgreSQL, Firebase Firestore, or Supabase:';
doc.text(doc.splitTextToSize(storageIntro, 180), 15, y);
y += 6;

autoTable(doc, {
  startY: y,
  margin: { left: 14, right: 14 },
  head: [['Storage Key', 'Type', 'Description / Business Logic']],
  body: [
    ['kavitha_live_gold_rate', 'localStorage', 'Global 22K gold rate (INR/g). Changes propagate instantly across all product prices.'],
    ['kavitha_shopping_cart', 'sessionStorage', 'Active cart items, quantities, and selected purities.'],
    ['kavitha_onam_coupons', 'localStorage', 'Array of issued vouchers, customer phone mappings, issued dates, and redeemed statuses.'],
    ['kavitha_coupon_pool_config', 'localStorage', 'Dynamic campaign quota pools (e.g. ₹50,000, ₹25,000 caps) and probabilities.'],
    ['kavitha_bsnl_dlt_config', 'localStorage', 'BSNL DLT Entity ID, 6-letter Header (KAVITH), Approved Template ID, and SMS Gateway mode.'],
    ['kavitha_reviews_prod_{id}', 'localStorage', 'Customer reviews, ratings (1-5★), verified buyer tags, and helpful vote counts per SKU.']
  ],
  headStyles: { fillColor: MAROON, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: DARK_GRAY, cellPadding: 2 },
  columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
  theme: 'grid',
});

y = doc.lastAutoTable.finalY + 8;

// ---------------- 4. ADMIN & DLT SMS CAPABILITIES ----------------
checkPageBreak(40);
doc.setFillColor(...LIGHT_BG);
doc.rect(14, y, 182, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...MAROON);
doc.text('4. ADMIN CAPABILITIES & BSNL DLT TELECOM INTEGRATION', 18, y + 5);
y += 11;

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...DARK_GRAY);

const adminPoints = [
  '• Master Gold Rate Control: Updating the 22K rate in the admin portal immediately recalculates catalog pricing and checkout totals.',
  '• Quota Allocation Engine: Prevents financial budget overrun by capping high-tier rewards (e.g. max 2 x ₹50k, 5 x ₹25k).',
  '• BSNL DLT Compliance: Configured for TRAI mandate with Principal Entity ID, Header (KAVITH), and 100% compliant SMS templates.',
  '• SMS Gateway Support: Supports Fast2SMS, MSG91, TextLocal, Twilio, and Simulated Sandbox modes with an integrated live test utility.',
  '• VIP Voucher Generator & Margin Simulator: Issue custom direct vouchers to dignitaries and calculate making charge discount margins.'
];

adminPoints.forEach((point) => {
  checkPageBreak(7);
  const splitPt = doc.splitTextToSize(point, 180);
  doc.text(splitPt, 15, y);
  y += (splitPt.length * 4.2) + 1.5;
});

y += 4;

// ---------------- 5. CODE DIRECTORY MAP & DEVELOPER ROADMAP ----------------
checkPageBreak(45);
doc.setFillColor(...LIGHT_BG);
doc.rect(14, y, 182, 7, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...MAROON);
doc.text('5. CODEBASE MAP & RECOMMENDED NEXT STEPS', 18, y + 5);
y += 11;

autoTable(doc, {
  startY: y,
  margin: { left: 14, right: 14 },
  head: [['Directory / File', 'Contents & Action Items for Backend Developer']],
  body: [
    ['src/data/products.ts', 'Catalog & price calculations. Connect to database endpoints: GET /api/products, GET /api/products/:id.'],
    ['src/data/campaignData.ts', 'Campaign rules & quota engine. Connect to POST /api/vouchers/issue, POST /api/vouchers/redeem.'],
    ['src/data/dltSmsConfig.ts', 'DLT configuration & SMS triggers. Provide live Gateway API Key (Fast2SMS/MSG91) in Admin or ENV.'],
    ['src/data/reviewsData.ts', 'Customer reviews store. Connect to GET /api/reviews?productId=... and POST /api/reviews.'],
    ['src/views/CartView.tsx', 'Checkout flow. Ready for Razorpay / Cashfree / Stripe payment gateway SDK hookup.'],
    ['src/types.ts', 'Master TypeScript definitions (Product, Coupon, Review, CartItem, Order, User).']
  ],
  headStyles: { fillColor: GOLD, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { fontSize: 8, textColor: DARK_GRAY, cellPadding: 2 },
  columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
  theme: 'grid',
});

y = doc.lastAutoTable.finalY + 8;

// ---------------- FOOTER CALLOUT ----------------
checkPageBreak(25);
doc.setFillColor(...MAROON);
doc.roundedRect(14, y, 182, 22, 2, 2, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.text('QUICK START COMMANDS FOR DEVELOPERS:', 20, y + 7);

doc.setFont('courier', 'normal');
doc.setFontSize(8);
doc.setTextColor(...GOLD);
doc.text('npm install   &&   npm run dev (Port 3000)   &&   npm run lint   &&   npm run build', 20, y + 14);

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'Kavitha_Jewellery_Developer_Handover.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log('PDF successfully generated at:', outputPath);
