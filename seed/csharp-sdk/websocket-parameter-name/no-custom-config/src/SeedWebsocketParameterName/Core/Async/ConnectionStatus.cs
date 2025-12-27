namespace SeedWebsocketParameterName.Core.Async;

/// <summary>
/// Represents the current state of an asynchronous connection.
/// </summary>
public enum ConnectionStatus
{
    /// <summary>
    /// The connection is not established and no connection attempt is in progress.
    /// </summary>
    Disconnected,

    /// <summary>
    /// A connection attempt is currently in progress.
    /// </summary>
    Connecting,

    /// <summary>
    /// The connection is established and ready for communication.
    /// </summary>
    Connected,

    /// <summary>
    /// The connection is in the process of being closed or terminated.
    /// </summary>
    Disconnecting,
}
