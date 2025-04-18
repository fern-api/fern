using System;

namespace SeedMultiUrlEnvironment;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedMultiUrlEnvironmentException(string message, Exception? innerException = null)
    : Exception(message, innerException);
