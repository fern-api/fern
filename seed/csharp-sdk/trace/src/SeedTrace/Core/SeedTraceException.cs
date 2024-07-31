using System;

#nullable enable

namespace SeedTrace.Core;

public class SeedTraceException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
