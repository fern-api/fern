using System;

namespace SeedResponseProperty;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedResponsePropertyException(string message, Exception? innerException = null)
    : Exception(message, innerException);
