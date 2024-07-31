using System;

#nullable enable

namespace SeedUnknownAsAny.Core;

public class SeedUnknownAsAnyException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
