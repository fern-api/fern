using System;

#nullable enable

namespace SeedLiteral.Core;

public class SeedLiteralException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
