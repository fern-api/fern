// ReSharper disable All
#pragma warning disable
namespace SeedWebsocket.Core.WebSockets;

/// <summary>
/// Specifies the type of disconnection that occurred in a WebSocket connection.
/// </summary>
internal enum DisconnectionType
{
    /// <summary>
    /// Disconnection occurred due to the WebSocket client being disposed or exiting.
    /// </summary>
    Exit = 0,

    /// <summary>
    /// Connection was lost unexpectedly during normal operation.
    /// </summary>
    Lost = 1,

    /// <summary>
    /// Connection was lost due to not receiving any messages within the specified time range.
    /// </summary>
    NoMessageReceived = 2,

    /// <summary>
    /// Disconnection occurred due to a connection or reconnection error.
    /// </summary>
    Error = 3,

    /// <summary>
    /// Disconnection was explicitly requested by the user.
    /// </summary>
    ByUser = 4,

    /// <summary>
    /// Disconnection was requested by the server.
    /// </summary>
    ByServer = 5,
}
