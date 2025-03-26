using System;

namespace SeedPlainText;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedPlainTextException(string message, Exception? innerException = null)
    : Exception(message, innerException);
