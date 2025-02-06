using System;

namespace SeedFileDownload;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedFileDownloadException(string message, Exception? innerException = null)
    : Exception(message, innerException);
