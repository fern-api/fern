using System;

#nullable enable

namespace SeedValidation.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedValidationException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
