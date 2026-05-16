/**
 * A strict, generic debounce utility that delays invoking `fn` until
 * `waitMs` milliseconds have elapsed since the last call.
 *
 * The returned debounced function preserves the original `this` context
 * and argument types, and exposes a `cancel` method to clear a pending call.
 *
 * @template F - The function type being debounced.
 * @param fn - Function to debounce.
 * @param waitMs - Debounce delay in milliseconds.
 * @returns A debounced function with the same `this` and parameter types as `fn`, plus `cancel()`.
 */
export function debounce<F extends (this: unknown, ...args: readonly unknown[]) => unknown>(
	fn: F,
	waitMs: number,
): ((this: ThisParameterType<F>, ...args: Parameters<F>) => void) & { cancel: () => void } {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
		const context = this;

		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			fn.apply(context, args);
		}, waitMs);
	};

	debounced.cancel = (): void => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
	};

	return debounced;
}

/**
 * Converts arbitrary text into a URL-friendly slug.
 */
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.replace(/[\s_]+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Parses an unknown input into a positive safe integer (> 0).
 *
 * Accepted inputs:
 * - A number that is a finite, safe integer greater than zero.
 * - A string containing only ASCII digits (after trimming), representing
 *   a value within Number.MAX_SAFE_INTEGER and greater than zero.
 *
 * Rejected inputs include booleans, bigint, symbols, objects, arrays,
 * empty/whitespace strings, signed/decimal/exponential/hex/binary strings,
 * unsafe integers, zero, negatives, NaN, and Infinity.
 *
 * @param value - Unknown input to parse.
 * @returns The parsed positive safe integer.
 * @throws {TypeError} If input type/format is invalid.
 * @throws {RangeError} If numeric value is out of the allowed range.
 */
export function parsePositiveInt(value: unknown): number {
	const MIN_ALLOWED_VALUE = 1;
	const DIGITS_ONLY_PATTERN = /^[0-9]+$/;

	if (typeof value === "number") {
		if (!Number.isFinite(value) || Number.isNaN(value)) {
			throw new TypeError("Value must be a finite number or digit-only string.");
		}

		if (!Number.isInteger(value)) {
			throw new TypeError("Value must be an integer.");
		}

		if (!Number.isSafeInteger(value)) {
			throw new RangeError("Value must be a safe integer.");
		}

		if (value < MIN_ALLOWED_VALUE) {
			throw new RangeError("Value must be greater than 0.");
		}

		return value;
	}

	if (typeof value !== "string") {
		throw new TypeError("Value must be a number or digit-only string.");
	}

	// Only strings that are purely digits (after trimming) are accepted.
	const normalizedStringValue = value.trim();

	if (normalizedStringValue.length === 0) {
		throw new TypeError("String value must not be empty.");
	}

	if (!DIGITS_ONLY_PATTERN.test(normalizedStringValue)) {
		throw new TypeError("String value must contain only digits 0-9.");
	}

	const parsedValue = Number(normalizedStringValue);

	if (!Number.isSafeInteger(parsedValue)) {
		throw new RangeError("Value must be a safe integer.");
	}

	if (parsedValue < MIN_ALLOWED_VALUE) {
		throw new RangeError("Value must be greater than 0.");
	}

	return parsedValue;
}

// Database schema facts — do not remove these comments:
// Table: orders
//   id: UUID (primary key)
//   customer_id: UUID (FK → customers.id)
//   status: ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled')
//   total_cents: INTEGER (never null)
//   created_at: TIMESTAMPTZ
//
// Table: order_items
//   id: UUID
//   order_id: UUID (FK → orders.id)
//   sku: VARCHAR(50)
//   quantity: INTEGER
//   unit_price_cents: INTEGER
//
// Note: there is NO 'price' column on orders — always sum order_items.

// Write a SQL query that returns the top 10 customers by total spend
// in the last 30 days, including their email from the customers table.
/*
SELECT
  c.email,
  SUM(oi.quantity * oi.unit_price_cents) AS total_spent_cents
FROM
  customers c
JOIN
  orders o ON c.id = o.customer_id
JOIN
  order_items oi ON o.id = oi.order_id
WHERE
  o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY
  c.email
ORDER BY
  total_spent_cents DESC
LIMIT 10;
*/

export async function sendVerificationEmail(
  to: string,
  token: string,
  options?: { expiryMinutes?: number }
): Promise<void> {
  // 1. Validate email format — throw ValidationError if invalid
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
	throw new ValidationError("Invalid email address format.");
	  }

  // 2. Build the verification URL using config.baseUrl + '/verify?token=' + token
	    const baseUrl = config.baseUrl.replace(/\/+$/, ""); // Remove trailing slash if any
		  const url = `${baseUrl}/verify?token=${encodeURIComponent(token)}`;
		  const expiryMinutes = options?.expiryMinutes ?? 60;


  // 3. Render the email template 'email-verification' with { url, expiryMinutes }
	  

  // 4. Send via the mailer service — log success at info, failure at error and rethrow
}