namespace SeedCsharpGlobalHeaderLiteralEnv;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCsharpGlobalHeaderLiteralEnvException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
