export function normalizeOutput(output) {
    return output
      .trim()  // Remove leading and trailing whitespace
      .replace(/\r\n/g, "\n")  // Normalize line endings
      .replace(/\n+/g, "\n");  // Replace multiple newlines with a single newline
  }
