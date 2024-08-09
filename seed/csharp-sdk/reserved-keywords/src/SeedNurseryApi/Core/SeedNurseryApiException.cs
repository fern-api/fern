using System;

#nullable enable

namespace SeedNurseryApi.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedNurseryApiException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
