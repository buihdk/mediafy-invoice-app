/**
 * Parse a date string in MM/DD/YYYY format and return a Date object or null
 */
export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Comparator to sort dates in a grid or array
 */
export function dateSortComparator(v1?: Date, v2?: Date): number {
  if (!v1) return -1;
  if (!v2) return 1;
  return v1.getTime() - v2.getTime();
}

/**
 * Format a Date object as MM/DD/YYYY
 */
export function formatDate(date?: Date | null): string {
  if (!date || isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format a string or number as phone (xxx) xxx-xxxx
 */
export function formatPhoneNumber(phone?: string | number): string {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, ""); // Remove all non-digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return String(phone); // If phone number is invalid, return as is
}

/**
 * Format a number as USD
 */
export function formatMoney(value?: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(value || 0);
}

interface ServiceCode {
  id: string;
  label: string;
  monthly: number;
  yearly: number;
  hex: string;
}

export const serviceCodes: ServiceCode[] = [
  {
    id: "SITE-10",
    label: "10 Page Website ($500.00)",
    monthly: 500,
    yearly: 6000,
    hex: "#e4f8ba",
  },
  {
    id: "SITE-5",
    label: "5 Page Website ($250.00)",
    monthly: 250,
    yearly: 3000,
    hex: "#b7f5da",
  },
  {
    id: "PAGES",
    label: "Additional Pages ($200.00)",
    monthly: 200,
    yearly: 2400,
    hex: "#d3d3ff",
  },
  {
    id: "BROADLY",
    label: "Broadly ($300.00)",
    monthly: 300,
    yearly: 3600,
    hex: "#d1e7dd",
  },
  {
    id: "CITYPAGES",
    label: "City Pages ($125.00)",
    monthly: 125,
    yearly: 1500,
    hex: "#e9d8fd",
  },
  {
    id: "EMAIL",
    label: "Domain Emails ($30.00)",
    monthly: 30,
    yearly: 360,
    hex: "#a2a7f5",
  },
  {
    id: "E-HOST",
    label: "E-Commerce Hosting ($300.00)",
    monthly: 300,
    yearly: 3600,
    hex: "#f1bcf7",
  },
  {
    id: "E-SITE",
    label: "E-Commerce Website ($500.00)",
    monthly: 500,
    yearly: 6000,
    hex: "#f5f5dc",
  },
  {
    id: "GOOGLEADS",
    label: "Google Ads ($0.00)",
    monthly: 0,
    yearly: 0,
    hex: "#f8efd4",
  },
  {
    id: "GBP",
    label: "Google Business Profile ($125.00)",
    monthly: 125,
    yearly: 1500,
    hex: "#d1c4e9",
  },
  {
    id: "HOST",
    label: "Hosting w/ SSL ($100.00)",
    monthly: 100,
    yearly: 1200,
    hex: "#e0f7fa",
  },
  {
    id: "LLM",
    label: "Local Listing Management ($125.00)",
    monthly: 125,
    yearly: 1500,
    hex: "#ffecb3",
  },
  {
    id: "LSA",
    label: "Local Service Ads ($0.00)",
    monthly: 0,
    yearly: 0,
    hex: "#ffcdd2",
  },
  {
    id: "ONLINEORDER",
    label: "Online Ordering ($125.00)",
    monthly: 125,
    yearly: 1500,
    hex: "#dcedc8",
  },
  {
    id: "GRM",
    label: "Online Reputation Management ($125.00)",
    monthly: 125,
    yearly: 1500,
    hex: "#fec464",
  },
  {
    id: "PREMPACK",
    label: "Premium Package ($600.00)",
    monthly: 600,
    yearly: 7200,
    hex: "#ede7f6",
  },
  {
    id: "BOOST",
    label: "SEO Power Booster ($250.00)",
    monthly: 250,
    yearly: 3000,
    hex: "#daf4f2",
  },
  {
    id: "SMMADS",
    label: "Social Ads ($0.00)",
    monthly: 0,
    yearly: 0,
    hex: "#fbe9e7",
  },
  {
    id: "SMM",
    label: "Social Media Management ($275.00)",
    monthly: 275,
    yearly: 3300,
    hex: "#ffecb3",
  },
  {
    id: "STARTLLM",
    label: "Starter + SEO ($550.00)",
    monthly: 550,
    yearly: 6600,
    hex: "#e6ee9c",
  },
  {
    id: "STARTPACK",
    label: "Starter Package ($450.00)",
    monthly: 450,
    yearly: 5400,
    hex: "#dcedc8",
  },
  {
    id: "STARTLLMBOO",
    label: "Starter Package w/ LLM & Boost ($750.00)",
    monthly: 750,
    yearly: 9000,
    hex: "#f8bbd0",
  },
  {
    id: "PREMLLM",
    label: "Premium Package w/ LLM ($700.00)",
    monthly: 700,
    yearly: 8400,
    hex: "#c8e6c9",
  },
  {
    id: "PREMLLMBOO",
    label: "Premium Package w/ LLM & Boost ($900.00)",
    monthly: 900,
    yearly: 10800,
    hex: "#ffccbc",
  },
  {
    id: "ECOMPACK",
    label: "E-Commerce Package ($750.00)",
    monthly: 750,
    yearly: 9000,
    hex: "#ffcc80",
  },
  {
    id: "SITE-1",
    label: "Website One ($50.00)",
    monthly: 50,
    yearly: 600,
    hex: "#ffe082",
  },
  {
    id: "BLOG",
    label: "Blogs ($250.00)",
    monthly: 250,
    yearly: 3000,
    hex: "#fff59d",
  },
  {
    id: "LOGO",
    label: "Logo ($16.66)",
    monthly: 16.66,
    yearly: 200,
    hex: "#e1bee7",
  },
  {
    id: "BC",
    label: "Business Cards ($5.00)",
    monthly: 5,
    yearly: 60,
    hex: "#c5cae9",
  },
  {
    id: "GRR",
    label: "Google Review Removal ($208.33)",
    monthly: 208.33,
    yearly: 2500,
    hex: "#bbdefb",
  },
  {
    id: "CUSTOMSERVICE",
    label: "Custom Service ($0.00)",
    monthly: 0,
    yearly: 0,
    hex: "#a4ebe8",
  },
];
