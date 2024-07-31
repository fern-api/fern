using System;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables.Core;

public class SeedBasicAuthEnvironmentVariablesException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
