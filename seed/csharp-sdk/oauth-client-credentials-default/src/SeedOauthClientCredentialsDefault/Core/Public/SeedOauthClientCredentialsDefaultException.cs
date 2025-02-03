using System;

namespace SeedOauthClientCredentialsDefault;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedOauthClientCredentialsDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException);
