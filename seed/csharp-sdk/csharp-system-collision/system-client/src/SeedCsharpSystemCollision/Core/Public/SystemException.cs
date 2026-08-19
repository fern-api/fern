namespace SeedCsharpSystemCollision;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SystemException(string message, Exception? innerException = null)
    : Exception(message, innerException);
