export function parseDate(value) {
  if (!value) return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

export function dateSortComparator(v1, v2) {
  if (!v1) return -1;
  if (!v2) return 1;
  return v1.getTime() - v2.getTime();
}

export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Helper function to format phone numbers: (xxx) xxx-xxxx
export function formatPhoneNumber(phone) {
  if (!phone) return "";
  const cleaned = ("" + phone).replace(/\D/g, ""); // Remove all non-digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone; // If phone number is invalid, return as is
}

// Helper function to format money values with commas
export function formatMoney(value) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(value || 0);
}

export const serviceCodes = [
  {
    id: "SITE-10",
    label: "10 Page Website ($500.00)",
    monthly: 500,
    yearly: 6000,
  },
  {
    id: "SITE-5",
    label: "5 Page Website ($250.00)",
    monthly: 250,
    yearly: 3000,
  },
  {
    id: "PAGES",
    label: "Additional Pages ($200.00)",
    monthly: 200,
    yearly: 2400,
  },
  { id: "BROADLY", label: "Broadly ($300.00)", monthly: 300, yearly: 3600 },
  {
    id: "CITYPAGES",
    label: "City Pages ($125.00)",
    monthly: 125,
    yearly: 1500,
  },
  { id: "EMAIL", label: "Domain Emails ($30.00)", monthly: 30, yearly: 360 },
  {
    id: "E-HOST",
    label: "E-Commerce Hosting ($300.00)",
    monthly: 300,
    yearly: 3600,
  },
  {
    id: "E-SITE",
    label: "E-Commerce Website ($500.00)",
    monthly: 500,
    yearly: 6000,
  },
  { id: "GOOGLEADS", label: "Google Ads ($0.00)", monthly: 0, yearly: 0 },
  {
    id: "GBP",
    label: "Google Business Profile ($125.00)",
    monthly: 125,
    yearly: 1500,
  },
  { id: "HOST", label: "Hosting w/ SSL ($100.00)", monthly: 100, yearly: 1200 },
  {
    id: "LLM",
    label: "Local Listing Management ($125.00)",
    monthly: 125,
    yearly: 1500,
  },
  { id: "LSA", label: "Local Service Ads ($0.00)", monthly: 0, yearly: 0 },
  {
    id: "ONLINEORDER",
    label: "Online Ordering ($125.00)",
    monthly: 125,
    yearly: 1500,
  },
  {
    id: "GRM",
    label: "Online Reputation Management ($125.00)",
    monthly: 125,
    yearly: 1500,
  },
  {
    id: "PREMPACK",
    label: "Premium Package ($600.00)",
    monthly: 600,
    yearly: 7200,
  },
  {
    id: "BOOST",
    label: "SEO Power Booster ($250.00)",
    monthly: 250,
    yearly: 3000,
  },
  { id: "SMMADS", label: "Social Ads ($0.00)", monthly: 0, yearly: 0 },
  {
    id: "SMM",
    label: "Social Media Management ($275.00)",
    monthly: 275,
    yearly: 3300,
  },
  {
    id: "STARTLLM",
    label: "Starter + SEO ($550.00)",
    monthly: 550,
    yearly: 6600,
  },
  {
    id: "STARTPACK",
    label: "Starter Package ($450.00)",
    monthly: 450,
    yearly: 5400,
  },
  {
    id: "STARTLLMBOO",
    label: "Starter Package w/ LLM & Boost ($750.00)",
    monthly: 750,
    yearly: 9000,
  },
  {
    id: "PREMLLM",
    label: "Premium Package w/ LLM ($700.00)",
    monthly: 700,
    yearly: 8400,
  },
  {
    id: "PREMLLMBOO",
    label: "Premium Package w/ LLM & Boost ($900.00)",
    monthly: 900,
    yearly: 10800,
  },
  {
    id: "ECOMPACK",
    label: "E-Commerce Package ($750.00)",
    monthly: 750,
    yearly: 9000,
  },
  { id: "SITE-1", label: "Website One (OTF)", monthly: 0, yearly: 600 },
  { id: "BLOG", label: "Blogs ($250.00)", monthly: 250, yearly: 3000 },
  { id: "LOGO", label: "Logo (OTF)", monthly: 0, yearly: 200 },
  { id: "BC", label: "Business Cards ($5.00)", monthly: 5, yearly: 60 },
  {
    id: "GRR",
    label: "Google Review Removal ($208.33)",
    monthly: 208.33,
    yearly: 2500,
  },
  {
    id: "CUSTOMSERVICE",
    label: "Custom Service ($0.00)",
    monthly: 0,
    yearly: 0,
  },
];
