using System;

#nullable enable

namespace SeedUndiscriminatedUnions.Core;

public class SeedUndiscriminatedUnionsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
