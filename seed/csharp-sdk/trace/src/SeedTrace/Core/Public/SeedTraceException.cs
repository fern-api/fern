namespace SeedTrace;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedTraceException(string message, System.Exception? innerException = null)
    : System.Exception(message, innerException);
