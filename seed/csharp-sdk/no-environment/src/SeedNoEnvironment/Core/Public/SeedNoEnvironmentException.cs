using System;

namespace SeedNoEnvironment;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedNoEnvironmentException(string message, Exception? innerException = null)
    : Exception(message, innerException);
