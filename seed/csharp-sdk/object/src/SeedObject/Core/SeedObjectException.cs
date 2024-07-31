using System;

#nullable enable

namespace SeedObject.Core;

public class SeedObjectException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
