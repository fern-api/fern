using System;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedMultiUrlEnvironmentNoDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
