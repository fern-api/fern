using System;

#nullable enable

namespace SeedResponseProperty.Core;

public class SeedResponsePropertyException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
