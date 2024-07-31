using System;

#nullable enable

namespace SeedApiWideBasePath.Core;

public class SeedApiWideBasePathException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
