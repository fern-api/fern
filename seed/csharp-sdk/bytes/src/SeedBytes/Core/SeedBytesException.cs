using System;

#nullable enable

namespace SeedBytes.Core;

public class SeedBytesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
