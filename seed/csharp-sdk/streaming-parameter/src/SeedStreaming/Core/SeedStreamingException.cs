using System;

#nullable enable

namespace SeedStreaming.Core;

public class SeedStreamingException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
