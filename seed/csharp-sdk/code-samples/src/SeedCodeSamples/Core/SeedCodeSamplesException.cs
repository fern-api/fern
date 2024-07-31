using System;

#nullable enable

namespace SeedCodeSamples.Core;

public class SeedCodeSamplesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
