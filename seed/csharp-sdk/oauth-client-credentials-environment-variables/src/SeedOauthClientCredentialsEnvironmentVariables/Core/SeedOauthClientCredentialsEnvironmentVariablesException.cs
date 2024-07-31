using System;

#nullable enable

namespace SeedOauthClientCredentialsEnvironmentVariables.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedOauthClientCredentialsEnvironmentVariablesException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
