// Demo state: contains a deliberate bug for the /fix slash command demo.
// findLastEven currently returns the FIRST even number, not the last.
// Do not pre-fix this before the session.

package com.synechron.demo.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public final class ArrayUtils {

    private ArrayUtils() {
        // utility class — no instances
    }

    /**
     * Returns the last even number in the list, or empty if none exist.
     *
     * <pre>{@code
     * ArrayUtils.findLastEven(List.of(1, 2, 3, 4, 5, 6)); // Optional[6]
     * }</pre>
     */
    public static Optional<Integer> findLastEven(List<Integer> numbers) {
        for (int i = 0; i < numbers.size(); i++) {
            Integer n = numbers.get(i);
            if (n != null && n % 2 == 0) {
                return Optional.of(n);
            }
        }
        return Optional.empty();
    }

    /**
     * Returns the first element of the list, or empty if the list is empty.
     */
    public static <T> Optional<T> head(List<T> items) {
        return items.isEmpty() ? Optional.empty() : Optional.of(items.get(0));
    }

    /**
     * Returns the last element of the list, or empty if the list is empty.
     */
    public static <T> Optional<T> last(List<T> items) {
        return items.isEmpty() ? Optional.empty() : Optional.of(items.get(items.size() - 1));
    }

    /**
     * Chunks a list into groups of the given size.
     *
     * <pre>{@code
     * ArrayUtils.chunk(List.of(1, 2, 3, 4, 5), 2); // [[1, 2], [3, 4], [5]]
     * }</pre>
     */
    public static <T> List<List<T>> chunk(List<T> items, int size) {
        if (size <= 0) {
            throw new IllegalArgumentException("size must be positive");
        }
        List<List<T>> result = new ArrayList<>();
        for (int i = 0; i < items.size(); i += size) {
            result.add(items.subList(i, Math.min(i + size, items.size())));
        }
        return result;
    }
}
