namespace SeedCsharpNamespaceCollision;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCsharpNamespaceCollisionException(string message, Exception? innerException = null)
    : Exception(message, innerException);
