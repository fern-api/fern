using System;

namespace SeedWebsocket;

/// <summary>
/// Base exception class for all exceptions thrown by the SDK.
/// </summary>
public class SeedWebsocketException(string message, Exception? innerException = null)
    : Exception(message, innerException);
