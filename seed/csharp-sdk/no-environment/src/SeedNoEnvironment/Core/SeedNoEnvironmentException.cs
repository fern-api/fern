using System;

#nullable enable

namespace SeedNoEnvironment.Core;

public class SeedNoEnvironmentException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
