using System;

namespace SeedAccept;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedAcceptException(string message, Exception? innerException = null)
    : Exception(message, innerException);
