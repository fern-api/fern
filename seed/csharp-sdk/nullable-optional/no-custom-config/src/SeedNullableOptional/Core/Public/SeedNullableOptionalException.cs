namespace SeedNullableOptional;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedNullableOptionalException(string message, Exception? innerException = null)
    : Exception(message, innerException);
