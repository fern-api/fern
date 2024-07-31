using System;

#nullable enable

namespace SeedBasicAuth.Core;

public class SeedBasicAuthException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
