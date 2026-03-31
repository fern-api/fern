namespace SeedRequestParameters;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedRequestParametersException(string message, Exception? innerException = null)
    : Exception(message, innerException);
