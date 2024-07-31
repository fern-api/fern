using System;

#nullable enable

namespace SeedAuthEnvironmentVariables.Core;

public class SeedAuthEnvironmentVariablesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
