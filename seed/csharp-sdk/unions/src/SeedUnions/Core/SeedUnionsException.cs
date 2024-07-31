using System;

#nullable enable

namespace SeedUnions.Core;

public class SeedUnionsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
