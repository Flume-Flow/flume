// Plain JS with branches — "testable" logic, but intentionally NOT covered by
// any vitest test. This package has no vitest config and is not a vitest
// project.

export function classify(n) {
    if (n > 0) {
        return 'positive';
    }
    if (n < 0) {
        return 'negative';
    }
    return 'zero';
}

export function add(a, b) {
    return a + b;
}
