using System;

#nullable enable

namespace SeedSingleUrlEnvironmentDefault.Core;

public class SeedSingleUrlEnvironmentDefaultException(
    string message,
    Exception? innerException = null
) : Exception(message, innerException) { }
