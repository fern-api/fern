using System;

#nullable enable

namespace SeedOauthClientCredentials.Core;

public class SeedOauthClientCredentialsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
