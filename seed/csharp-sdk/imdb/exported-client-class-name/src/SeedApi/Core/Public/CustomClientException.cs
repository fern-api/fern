using System;

namespace SeedApi;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class CustomClientException(string message, Exception? innerException = null)
    : Exception(message, innerException);
