using System;

#nullable enable

namespace SeedObject.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedObjectException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
