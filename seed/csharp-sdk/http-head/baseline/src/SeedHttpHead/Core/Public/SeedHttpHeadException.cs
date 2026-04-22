namespace SeedHttpHead;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedHttpHeadException(string message, Exception? innerException = null)
    : Exception(message, innerException);
