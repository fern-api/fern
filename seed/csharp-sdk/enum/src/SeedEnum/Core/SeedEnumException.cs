using System;

#nullable enable

namespace SeedEnum.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedEnumException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
