using System;

namespace SeedBasicAuth;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedBasicAuthException(string message, Exception? innerException = null)
    : Exception(message, innerException);
