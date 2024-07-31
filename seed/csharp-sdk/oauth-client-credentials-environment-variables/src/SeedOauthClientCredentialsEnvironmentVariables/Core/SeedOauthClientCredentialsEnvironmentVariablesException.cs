using System;

#nullable enable

namespace SeedOauthClientCredentialsEnvironmentVariables.Core;

public class SeedOauthClientCredentialsEnvironmentVariablesException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
