using System;

#nullable enable

namespace SeedCustomAuth.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCustomAuthException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
