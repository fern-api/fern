using System;

namespace SeedMixedFileDirectory;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedMixedFileDirectoryException(string message, Exception? innerException = null)
    : Exception(message, innerException);
