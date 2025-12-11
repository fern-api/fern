namespace SeedLiteral;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedLiteralException(string message, Exception? innerException = null)
    : Exception(message, innerException);
