namespace SeedBytesUpload;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedBytesUploadException(string message, Exception? innerException = null)
    : Exception(message, innerException);
