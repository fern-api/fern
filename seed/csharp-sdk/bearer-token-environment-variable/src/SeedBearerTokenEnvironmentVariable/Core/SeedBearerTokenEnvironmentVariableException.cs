using System;

#nullable enable

namespace SeedBearerTokenEnvironmentVariable.Core;

public class SeedBearerTokenEnvironmentVariableException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
