using System;

namespace SeedLicense;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedLicenseException(string message, Exception? innerException = null)
    : Exception(message, innerException);
