namespace SeedCsharpElidePathParameters;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCsharpElidePathParametersException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
