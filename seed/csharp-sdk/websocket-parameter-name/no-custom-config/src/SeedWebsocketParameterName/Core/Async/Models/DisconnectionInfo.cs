// ReSharper disable All
#pragma warning disable
using System.Net.WebSockets;

namespace SeedWebsocketParameterName.Core.Async.Models;

/// <summary>
/// Contains information about a WebSocket disconnection event.
/// Provides details about the reason for disconnection and associated metadata.
/// </summary>
internal class DisconnectionInfo
{
    /// <summary>
    /// Initializes a new instance of the DisconnectionInfo class.
    /// </summary>
    /// <param name="type">The type of disconnection that occurred.</param>
    /// <param name="closeStatus">The WebSocket close status code, if available.</param>
    /// <param name="closeStatusDescription">The description of the close status.</param>
    /// <param name="subProtocol">The subprotocol that was negotiated during the opening handshake.</param>
    /// <param name="exception">The exception that caused the disconnection, if any.</param>
    public DisconnectionInfo(
        DisconnectionType type,
        WebSocketCloseStatus? closeStatus,
        string closeStatusDescription,
        string subProtocol,
        Exception exception
    )
    {
        Type = type;
        CloseStatus = closeStatus;
        CloseStatusDescription = closeStatusDescription;
        SubProtocol = subProtocol;
        Exception = exception;
    }

    /// <summary>
    /// Gets the type of disconnection that occurred.
    /// </summary>
    public DisconnectionType Type { get; }

    /// <summary>
    /// Gets the WebSocket close status code that indicates the reason why the remote endpoint initiated the close handshake.
    /// </summary>
    public WebSocketCloseStatus? CloseStatus { get; }

    /// <summary>
    /// Gets the description that allows the remote endpoint to describe the reason why the connection was closed.
    /// </summary>
    public string CloseStatusDescription { get; }

    /// <summary>
    /// Gets the subprotocol that was negotiated during the opening handshake.
    /// </summary>
    public string SubProtocol { get; }

    /// <summary>
    /// Gets the exception that caused the disconnection, if any.
    /// </summary>
    public Exception Exception { get; }

    /// <summary>
    /// Gets or sets a value indicating whether to cancel ongoing reconnection attempts.
    /// </summary>
    public bool CancelReconnection { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to cancel ongoing connection close (only when Type = ByServer).
    /// </summary>
    public bool CancelClosing { get; set; }

    /// <summary>
    /// Creates a new DisconnectionInfo instance using the provided WebSocket client and exception.
    /// </summary>
    /// <param name="type">The type of disconnection that occurred.</param>
    /// <param name="client">The WebSocket client that was disconnected.</param>
    /// <param name="exception">The exception that caused the disconnection, if any.</param>
    /// <returns>A new DisconnectionInfo instance.</returns>
    public static DisconnectionInfo Create(
        DisconnectionType type,
        WebSocket client,
        Exception exception
    )
    {
        return new DisconnectionInfo(
            type,
            client?.CloseStatus,
            client?.CloseStatusDescription,
            client?.SubProtocol,
            exception
        );
    }
}
