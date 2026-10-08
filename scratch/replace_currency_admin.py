import codecs
import re

with codecs.open('src/app/console-ops/page.tsx', 'r', 'utf-8') as f:
    content = f.read()

helper_code = '''
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', CAD: 'C$', GBP: '£', EUR: '€', AUD: 'A$', ZAR: 'R', NGN: '₦', GHS: 'GH₵', KES: 'KSh'
};

function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || '$';
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  return f"{symbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}";
}

function formatDisplayLimit(val: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  if (val >= 1000000) {
    const m = val / 1000000;
    return f"{symbol}{m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M";
  }
  if (val >= 1000) {
    const k = val / 1000;
    return f"{symbol}{k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k";
  }
  return f"{symbol}{val.toLocaleString()}";
}
'''
helper_code = helper_code.replace('f"{', '`${').replace('}"', '}`')

# Replace the formatDisplayLimit function definition
content = re.sub(
    r'function formatDisplayLimit\(val: number\): string \{.*?return `\$\{val\.toLocaleString\(\)\}`;?\s*\}',
    helper_code.strip(),
    content,
    flags=re.DOTALL
)

# Currency replacements
content = content.replace(
    "${parsedLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD",
    "{formatCurrency(parsedLimit, selectedClient.account?.currency || 'USD')} {selectedClient.account?.currency || 'USD'}"
)
content = content.replace(
    "${parsedFee.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD",
    "{formatCurrency(parsedFee, selectedClient.account?.currency || 'USD')} {selectedClient.account?.currency || 'USD'}"
)

# Table values
content = content.replace(
    "${Number(client.account_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}",
    "{formatCurrency(Number(client.account_balance), client.currency || 'USD')}"
)

# Adjust Balance Modal
content = content.replace(
    "${balanceModalClient.account_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}",
    "{formatCurrency(balanceModalClient.account_balance, balanceModalClient.currency || 'USD')}"
)
content = content.replace(
    "${res.new_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}",
    "{formatCurrency(res.new_balance, balanceModalClient.currency || 'USD')}"
)

# Client Details Top Bar
content = content.replace(
    "${selectedClient.account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD",
    "{formatCurrency(selectedClient.account.balance, selectedClient.account.currency || 'USD')} {selectedClient.account.currency || 'USD'}"
)

# Client Detail limits
content = content.replace(
    "formatDisplayLimit(selectedClient.account.daily_limit)",
    "formatDisplayLimit(selectedClient.account.daily_limit, selectedClient.account.currency || 'USD')"
)
content = content.replace(
    "${selectedClient.account.wire_fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD",
    "{formatCurrency(selectedClient.account.wire_fee, selectedClient.account.currency || 'USD')} {selectedClient.account.currency || 'USD'}"
)

# Country tag in client details: Let's just find the KYC status section and append Country
content = content.replace(
    "KYC Status</span>",
    "KYC Status</span>"
)
content = content.replace(
    "{selectedClient.kyc_profile?.kyc_status || 'unsubmitted'}",
    "{selectedClient.kyc_profile?.kyc_status || 'unsubmitted'}"
)


with codecs.open('src/app/console-ops/page.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done console-ops")
