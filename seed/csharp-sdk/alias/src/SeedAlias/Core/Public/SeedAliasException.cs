using System;

namespace SeedAlias;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedAliasException(string message, Exception? innerException = null)
    : Exception(message, innerException);
