using System;

#nullable enable

namespace SeedVersion.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedVersionException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
