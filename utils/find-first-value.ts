type NestedObject = {
  // deno-lint-ignore no-explicit-any
  [key: string]: NestedObject | any;
};

/**
 * Recursively search for the first value of the specified key in an object.
 * @param obj The object to search in.
 * @param searchKey The key to search for.
 * @returns The found value or undefined.
 */
// deno-lint-ignore no-explicit-any
export function findFirstValue(obj: NestedObject, searchKey: string): any {
  // If the input is not an object or is null, return undefined directly.
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }

  // Check if the current level has the key to be searched.
  if (searchKey in obj) {
    return obj[searchKey];
  }

  // Iterate through all the values of the object.
  for (const value of Object.values(obj)) {
    // If the value is an object, recursively search.
    if (typeof value === 'object' && value !== null) {
      const result = findFirstValue(value, searchKey);
      // If the value is found, return it and stop searching.
      if (result !== undefined) {
        return result;
      }
    }
  }

  // If the value is not found, return undefined.
  return undefined;
}
