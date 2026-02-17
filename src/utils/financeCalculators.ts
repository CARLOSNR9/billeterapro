export const calculateInterestRate = (principal: number, installments: number, installmentAmount: number): number | null => {
    // Newton-Raphson method to find the monthly interest rate
    // Formula: A = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    // We want to find r where f(r) = 0

    if (installments <= 0 || principal <= 0 || installmentAmount <= 0) return null;
    if (installmentAmount * installments <= principal) return 0; // No interest or negative interest

    let r = 0.01; // Initial guess (1%)
    const maxIterations = 50;
    const tolerance = 1e-6;

    for (let i = 0; i < maxIterations; i++) {
        const pow = Math.pow(1 + r, installments);
        const f = (principal * r * pow) / (pow - 1) - installmentAmount;

        // Derivative f'(r)
        // P * [ (pow + r*n*pow/(1+r)) * (pow-1) - (r*pow) * (n*pow/(1+r)) ] / (pow-1)^2
        // Simplified approach for approximation if exact derivative is complex:
        // Use numerical derivative
        const h = 1e-5;
        const powH = Math.pow(1 + r + h, installments);
        const fH = (principal * (r + h) * powH) / (powH - 1) - installmentAmount;
        const df = (fH - f) / h;

        const newR = r - f / df;

        if (Math.abs(newR - r) < tolerance) {
            return newR * 100; // Return as percentage (e.g., 3.45)
        }

        r = newR;
    }

    return r * 100;
};
