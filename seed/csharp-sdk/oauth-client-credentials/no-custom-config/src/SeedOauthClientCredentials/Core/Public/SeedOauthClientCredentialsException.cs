using System;

namespace SeedOauthClientCredentials;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedOauthClientCredentialsException(string message, Exception? innerException = null)
    : Exception(message, innerException);
