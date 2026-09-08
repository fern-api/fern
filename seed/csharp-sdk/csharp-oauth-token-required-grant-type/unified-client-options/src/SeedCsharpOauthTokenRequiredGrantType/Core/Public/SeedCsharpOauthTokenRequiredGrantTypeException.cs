namespace SeedCsharpOauthTokenRequiredGrantType;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCsharpOauthTokenRequiredGrantTypeException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
