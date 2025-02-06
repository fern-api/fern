using System;

namespace SeedBasicAuthEnvironmentVariables;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedBasicAuthEnvironmentVariablesException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
