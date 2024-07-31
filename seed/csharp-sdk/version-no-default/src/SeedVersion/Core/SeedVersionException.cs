using System;

#nullable enable

namespace SeedVersion.Core;

public class SeedVersionException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
