using System;

namespace SeedObjectsWithImports;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedObjectsWithImportsException(string message, Exception? innerException = null)
    : Exception(message, innerException);
