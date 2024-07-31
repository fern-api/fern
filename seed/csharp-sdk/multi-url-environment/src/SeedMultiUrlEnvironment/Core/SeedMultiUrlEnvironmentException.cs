using System;

#nullable enable

namespace SeedMultiUrlEnvironment.Core;

public class SeedMultiUrlEnvironmentException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
