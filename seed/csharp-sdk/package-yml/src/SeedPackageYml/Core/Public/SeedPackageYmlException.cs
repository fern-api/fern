using System;

namespace SeedPackageYml;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedPackageYmlException(string message, Exception? innerException = null)
    : Exception(message, innerException);
