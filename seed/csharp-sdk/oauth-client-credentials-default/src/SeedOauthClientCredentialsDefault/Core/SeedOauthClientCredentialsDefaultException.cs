using System;

#nullable enable

namespace SeedOauthClientCredentialsDefault.Core;

public class SeedOauthClientCredentialsDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
