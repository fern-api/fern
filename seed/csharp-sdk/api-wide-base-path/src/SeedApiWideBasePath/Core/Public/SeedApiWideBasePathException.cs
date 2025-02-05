using System;

namespace SeedApiWideBasePath;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedApiWideBasePathException(string message, Exception? innerException = null)
    : Exception(message, innerException);
