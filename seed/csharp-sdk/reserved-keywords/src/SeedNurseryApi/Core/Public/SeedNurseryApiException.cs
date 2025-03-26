using System;

namespace SeedNurseryApi;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedNurseryApiException(string message, Exception? innerException = null)
    : Exception(message, innerException);
