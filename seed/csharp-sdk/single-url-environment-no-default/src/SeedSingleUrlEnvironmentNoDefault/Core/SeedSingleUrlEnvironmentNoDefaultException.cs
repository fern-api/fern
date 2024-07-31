using System;

#nullable enable

namespace SeedSingleUrlEnvironmentNoDefault.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedSingleUrlEnvironmentNoDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
