namespace SeedPaginationUriPath;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedPaginationUriPathException(string message, Exception? innerException = null)
    : Exception(message, innerException);
