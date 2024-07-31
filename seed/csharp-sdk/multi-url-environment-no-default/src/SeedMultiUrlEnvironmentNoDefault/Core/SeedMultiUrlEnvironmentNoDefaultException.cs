using System;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault.Core;

public class SeedMultiUrlEnvironmentNoDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
