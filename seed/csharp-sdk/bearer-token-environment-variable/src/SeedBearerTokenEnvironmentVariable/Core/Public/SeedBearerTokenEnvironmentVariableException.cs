using System;

namespace SeedBearerTokenEnvironmentVariable;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedBearerTokenEnvironmentVariableException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
