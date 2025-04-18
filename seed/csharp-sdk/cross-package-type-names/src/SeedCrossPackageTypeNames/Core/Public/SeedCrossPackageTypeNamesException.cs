using System;

namespace SeedCrossPackageTypeNames;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCrossPackageTypeNamesException(string message, Exception? innerException = null)
    : Exception(message, innerException);
