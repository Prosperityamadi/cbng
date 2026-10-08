import re
import codecs

with codecs.open('src/app/dashboard/page.tsx', 'r', 'utf-8') as f:
    content = f.read()

# Balance
content = content.replace(
    "${accountData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD",
    "{formatCurrency(accountData.balance, accountData.currency)} {accountData.currency}"
)
content = content.replace(
    "${accountData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD",
    "{formatCurrency(accountData.balance, accountData.currency)} {accountData.currency}"
)
content = content.replace(
    "`Insufficient available funds. Current balance: $${accountData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`",
    "`Insufficient available funds. Current balance: ${formatCurrency(accountData.balance, accountData.currency)} ${accountData.currency}.`"
)

# Wire Amount
content = content.replace(
    "${parseFloat(wireAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} USD",
    "{formatCurrency(parseFloat(wireAmount || '0'), accountData.currency)} {accountData.currency}"
)
content = content.replace(
    "${Number(pendingWire.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD",
    "{formatCurrency(Number(pendingWire.amount), accountData.currency)} {accountData.currency}"
)

# Transactions
content = content.replace(
    "${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}",
    "{formatCurrency(Math.abs(tx.amount), accountData.currency)}"
)
content = content.replace(
    "${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}",
    "{formatCurrency(Math.abs(tx.amount), accountData.currency)}"
)
content = content.replace(
    "{tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}",
    "{tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), accountData.currency)}"
)

# Wire Fee
content = content.replace(
    "${Number(accountData.wireFee).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}",
    "{formatCurrency(Number(accountData.wireFee), accountData.currency)}"
)
content = content.replace(
    "${Number(accountData.wireFee).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}",
    "{formatCurrency(Number(accountData.wireFee), accountData.currency)}"
)

# Daily Limit
content = content.replace(
    "formatDisplayLimit(accountData.dailyLimit)",
    "formatDisplayLimit(accountData.dailyLimit, accountData.currency)"
)

# Fix double $$ that might have happened if it was \$
content = content.replace(
    "$${",
    "${"
)

with codecs.open('src/app/dashboard/page.tsx', 'w', 'utf-8') as f:
    f.write(content)
print("Done")
