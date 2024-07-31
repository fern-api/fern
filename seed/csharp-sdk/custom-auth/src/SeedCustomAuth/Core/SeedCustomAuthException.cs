using System;

#nullable enable

namespace SeedCustomAuth.Core;

public class SeedCustomAuthException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
