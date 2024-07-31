using System;

#nullable enable

namespace SeedErrorProperty.Core;

public class SeedErrorPropertyException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
