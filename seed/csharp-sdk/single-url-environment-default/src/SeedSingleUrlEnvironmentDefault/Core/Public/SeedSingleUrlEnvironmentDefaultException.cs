using System;

namespace SeedSingleUrlEnvironmentDefault;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedSingleUrlEnvironmentDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
