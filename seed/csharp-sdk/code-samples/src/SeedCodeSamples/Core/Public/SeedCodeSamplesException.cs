using System;

#nullable enable

namespace SeedCodeSamples;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedCodeSamplesException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
