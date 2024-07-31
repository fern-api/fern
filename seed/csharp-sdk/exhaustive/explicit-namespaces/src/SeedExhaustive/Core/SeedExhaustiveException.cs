using System;

#nullable enable

namespace SeedExhaustive.Core;

public class SeedExhaustiveException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
