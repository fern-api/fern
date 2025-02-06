using System;

namespace SeedVariables;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedVariablesException(string message, Exception? innerException = null)
    : Exception(message, innerException);
