using System;

namespace SeedPublicObject;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedPublicObjectException(string message, Exception? innerException = null)
    : Exception(message, innerException);
