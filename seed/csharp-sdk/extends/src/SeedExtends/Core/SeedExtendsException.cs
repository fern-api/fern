using System;

#nullable enable

namespace SeedExtends.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedExtendsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
