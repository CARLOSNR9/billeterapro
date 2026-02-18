
function calculateAmortization() {
    const principal = 15000000;
    const installments = 36;
    const payment = 761000;

    // 1. Find Interest Rate (Newton-Raphson)
    let r = 0.01; // Guess 1%
    for (let i = 0; i < 50; i++) {
        const pow = Math.pow(1 + r, installments);
        const f = (principal * r * pow) / (pow - 1) - payment;
        const h = 1e-5;
        const powH = Math.pow(1 + r + h, installments);
        const fH = (principal * (r + h) * powH) / (powH - 1) - payment;
        const df = (fH - f) / h;
        r = r - f / df;
    }

    console.log(`Interest Rate (Monthly): ${(r * 100).toFixed(4)}%`);

    // 2. Generate Schedule
    let balance = principal;
    let totalCapitalPaid = 0;
    let totalInterestPaid = 0;

    console.log("\n| # | Payment | Interest | Capital | Balance |");
    console.log("|---|---|---|---|---|");

    for (let i = 1; i <= 36; i++) {
        const interest = balance * r;
        const capital = payment - interest;
        balance -= capital;

        if (i <= 15) {
            totalCapitalPaid += capital;
            totalInterestPaid += interest;
        }

        console.log(`| ${i} | ${Math.round(payment)} | ${Math.round(interest)} | ${Math.round(capital)} | ${Math.round(balance)} |`);

        if (i === 15) {
            console.log("\n--- STATUS AFTER 15 PAYMENTS (Nov 2024 to Jan 2026) ---");
            console.log(`Remaining Balance: ${Math.round(balance + capital)} - ${Math.round(capital)} = ${Math.round(balance)}`); // Balance AFTER payment 15
        }
    }

    console.log("\nSummary after 15 payments:");
    console.log(`Capital Paid: ${Math.round(totalCapitalPaid)}`);
    console.log(`Interest Paid: ${Math.round(totalInterestPaid)}`);
    console.log(`Remaining Debt: ${Math.round(principal - totalCapitalPaid)}`);
}

calculateAmortization();
