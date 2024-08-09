using System;

#nullable enable

namespace SeedUnknownAsAny.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedUnknownAsAnyException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
