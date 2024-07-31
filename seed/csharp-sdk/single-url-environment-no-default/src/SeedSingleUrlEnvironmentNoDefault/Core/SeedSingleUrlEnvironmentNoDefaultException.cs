using System;

#nullable enable

namespace SeedSingleUrlEnvironmentNoDefault.Core;

public class SeedSingleUrlEnvironmentNoDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
