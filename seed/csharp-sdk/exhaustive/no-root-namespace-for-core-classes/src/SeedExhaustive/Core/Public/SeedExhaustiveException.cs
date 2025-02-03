using System;

namespace SeedExhaustive.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedExhaustiveException(string message, Exception? innerException = null)
    : Exception(message, innerException);
