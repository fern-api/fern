namespace SeedOauthClientCredentialsMandatoryAuth;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedOauthClientCredentialsMandatoryAuthException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
