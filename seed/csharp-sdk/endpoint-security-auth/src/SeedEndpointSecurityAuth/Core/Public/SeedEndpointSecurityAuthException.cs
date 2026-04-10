namespace SeedEndpointSecurityAuth;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedEndpointSecurityAuthException(string message, Exception? innerException = null)
    : Exception(message, innerException);
