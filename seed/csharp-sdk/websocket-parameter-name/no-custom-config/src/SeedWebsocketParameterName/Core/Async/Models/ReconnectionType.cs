// ReSharper disable All
// #pragma warning disable
namespace SeedWebsocketParameterName.Core.Async.Models;

/// <summary>
/// Specifies the type of reconnection that occurred in a WebSocket connection.
/// </summary>
internal enum ReconnectionType
{
    /// <summary>
    /// Initial connection to the WebSocket stream.
    /// </summary>
    Initial = 0,

    /// <summary>
    /// Reconnection occurred because the connection was lost during normal operation.
    /// </summary>
    Lost = 1,

    /// <summary>
    /// Reconnection occurred because no messages were received within the specified time range.
    /// </summary>
    NoMessageReceived = 2,

    /// <summary>
    /// Reconnection occurred after a previous unsuccessful reconnection attempt.
    /// </summary>
    Error = 3,

    /// <summary>
    /// Reconnection was explicitly requested by the user.
    /// </summary>
    ByUser = 4,

    /// <summary>
    /// Reconnection was requested by the server.
    /// </summary>
    ByServer = 5,
}
