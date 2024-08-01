using System;

#nullable enable

namespace SeedApi.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class CustomException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
