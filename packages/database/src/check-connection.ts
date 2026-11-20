function safeErrorDetails(error: unknown): { name: string; message: string } {
  const name = error instanceof Error ? error.name : "UnknownError";
  const message =
    error instanceof Error ? error.message : "Unknown database error";
  const redactedMessage = message
    .replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/(password\s*[=:]\s*)\S+/gi, "$1[REDACTED]");

  return { name, message: redactedMessage };
}

let prisma: (typeof import("./client.js"))["prisma"] | undefined;

try {
  ({ prisma } = await import("./client.js"));
  await prisma.$queryRaw`SELECT 1`;
  console.info("Database connectivity verified.");
} catch (error) {
  console.error("Database connectivity failed.", safeErrorDetails(error));
  process.exitCode = 1;
} finally {
  await prisma?.$disconnect();
}
