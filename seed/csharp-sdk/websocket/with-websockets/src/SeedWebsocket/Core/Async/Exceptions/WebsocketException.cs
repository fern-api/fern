﻿// ReSharper disable All
#pragma warning disable
namespace SeedWebsocket.Core.Async.Exceptions;

/// <summary>
/// Custom exception related to WebSocket connection operations.
/// Thrown when WebSocket connection errors occur during connection, disconnection, or message handling.
/// </summary>
public class WebsocketException : Exception
{
    /// <summary>
    /// Initializes a new instance of the WebsocketException class.
    /// </summary>
    public WebsocketException() { }

    /// <summary>
    /// Initializes a new instance of the WebsocketException class with a specified error message.
    /// </summary>
    /// <param name="message">The message that describes the error.</param>
    public WebsocketException(string message)
        : base(message) { }

    /// <summary>
    /// Initializes a new instance of the WebsocketException class with a specified error message and a reference to the inner exception that is the cause of this exception.
    /// </summary>
    /// <param name="message">The error message that explains the reason for the exception.</param>
    /// <param name="innerException">The exception that is the cause of the current exception, or a null reference if no inner exception is specified.</param>
    public WebsocketException(string message, Exception innerException)
        : base(message, innerException) { }
}
