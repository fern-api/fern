using System;

namespace SeedExtraProperties;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedExtraPropertiesException(string message, Exception? innerException = null)
    : Exception(message, innerException);
