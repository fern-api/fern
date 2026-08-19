namespace SeedBasicAuthPwOmitted;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedBasicAuthPwOmittedException(string message, Exception? innerException = null)
    : Exception(message, innerException);
