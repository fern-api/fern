using System;

namespace SeedContentTypes;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedContentTypesException(string message, Exception? innerException = null)
    : Exception(message, innerException);
