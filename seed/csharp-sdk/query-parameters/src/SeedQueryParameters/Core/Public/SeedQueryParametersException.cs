using System;

namespace SeedQueryParameters;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedQueryParametersException(string message, Exception? innerException = null)
    : Exception(message, innerException);
