using System;

#nullable enable

namespace SeedServerSentEvents.Core;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedServerSentEventsException(string message, Exception? innerException = null)
    : Exception(message, innerException) { }
