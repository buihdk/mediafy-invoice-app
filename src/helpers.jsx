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
    id: "START",
    code: "START ($375.00)",
    label: "Starter Package ($375.00)",
    monthly: 375.0,
    yearly: 4500.0,
  },
  {
    id: "STARSEO",
    code: "STARSEO ($650.00)",
    label: "Starter + SEO ($650.00)",
    monthly: 650.0,
    yearly: 7800.0,
  },
  {
    id: "PREM",
    code: "PREM ($575.00)",
    label: "Premium Package ($575.00)",
    monthly: 575.0,
    yearly: 6900.0,
  },
  {
    id: "WEBS",
    code: "WEBS ($200.00)",
    label: "5 Page Website ($200.00)",
    monthly: 200.0,
    yearly: 2400.0,
  },
  {
    id: "WEBSP",
    code: "WEBSP ($300.00)",
    label: "10 Page Website ($300.00)",
    monthly: 300.0,
    yearly: 3600.0,
  },
  {
    id: "ECOMM",
    code: "ECOMM ($350.00)",
    label: "E-Commerce Website ($350.00)",
    monthly: 350.0,
    yearly: 4200.0,
  },
  {
    id: "HOST",
    code: "HOST ($100.00)",
    label: "Hosting w/ SSL ($100.00)",
    monthly: 100.0,
    yearly: 1200.0,
  },
  {
    id: "ECOMMHOST",
    code: "ECOMMHOST ($300.00)",
    label: "E-Commerce Hosting ($300.00)",
    monthly: 300.0,
    yearly: 3600.0,
  },
  {
    id: "GBP",
    code: "GBP ($100.00)",
    label: "Google Business Profile ($100.00)",
    monthly: 100.0,
    yearly: 1200.0,
  },
  {
    id: "LLM",
    code: "LLM ($100.00)",
    label: "Local Listing Management ($100.00)",
    monthly: 100.0,
    yearly: 1200.0,
  },
  {
    id: "SEOBOOST",
    code: "SEOBOOST ($200.00)",
    label: "SEO Power Booster ($200.00)",
    monthly: 200.0,
    yearly: 2400.0,
  },
  {
    id: "SMM",
    code: "SMM ($275.00)",
    label: "Social Media Management ($275.00)",
    monthly: 275.0,
    yearly: 3300.0,
  },
  {
    id: "FBADS",
    code: "FBADS ($0.00)",
    label: "Social ADs ($0.00)",
    monthly: 0.0,
    yearly: 0.0,
  },
  {
    id: "LSA",
    code: "LSA ($0.00)",
    label: "Local Service ADs ($0.00)",
    monthly: 0.0,
    yearly: 0.0,
  },
  {
    id: "GOOGLEADS",
    code: "GOOGLEADS ($0.00)",
    label: "Google ADs ($0.00)",
    monthly: 0.0,
    yearly: 0.0,
  },
  {
    id: "PAGE",
    code: "PAGE ($40.00)",
    label: "Additional Pages ($40.00)",
    monthly: 40.0,
    yearly: 480.0,
  },
  {
    id: "CITYPAGE",
    code: "CITYPAGE ($100.00)",
    label: "City Pages ($100.00)",
    monthly: 100.0,
    yearly: 1200.0,
  },
  {
    id: "EMAIL",
    code: "EMAIL ($30.00)",
    label: "Domain Emails ($30.00)",
    monthly: 30.0,
    yearly: 360.0,
  },
  {
    id: "BROAD",
    code: "BROAD ($300.00)",
    label: "Broadly ($300.00)",
    monthly: 300.0,
    yearly: 3600.0,
  },
  {
    id: "OREP",
    code: "OREP ($75.00)",
    label: "Online Reputation Management ($75.00)",
    monthly: 75.0,
    yearly: 900.0,
  },
  {
    id: "OO",
    code: "OO ($100.00)",
    label: "Online Ordering ($100.00)",
    monthly: 100.0,
    yearly: 1200.0,
  },
  {
    id: "GRR",
    code: "GRR ($208.33)",
    label: "Google Review Removal ($208.33)",
    monthly: 208.33,
    yearly: 2500.0,
  },
  {
    id: "BC",
    code: "BC ($5.00)",
    label: "Business Cards ($5.00)",
    monthly: 5.0,
    yearly: 60.0,
  },
];
