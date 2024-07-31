using System;

#nullable enable

namespace SeedIdempotencyHeaders.Core;

public class SeedIdempotencyHeadersException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
