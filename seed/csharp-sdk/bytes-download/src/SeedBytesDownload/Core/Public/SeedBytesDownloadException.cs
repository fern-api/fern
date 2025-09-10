namespace SeedBytesDownload;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedBytesDownloadException(string message, Exception? innerException = null)
    : Exception(message, innerException);
