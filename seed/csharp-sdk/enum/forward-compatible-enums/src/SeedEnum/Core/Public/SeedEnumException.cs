using System;

namespace SeedEnum;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedEnumException(string message, Exception? innerException = null)
    : Exception(message, innerException);
