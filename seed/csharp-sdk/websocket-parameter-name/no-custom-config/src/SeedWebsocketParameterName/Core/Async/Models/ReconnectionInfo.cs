// ReSharper disable All
#pragma warning disable
namespace SeedWebsocketParameterName.Core.Async.Models;

/// <summary>
/// Contains information about a WebSocket reconnection event.
/// Provides details about the reason for reconnection.
/// </summary>
internal class ReconnectionInfo
{
    /// <summary>
    /// Initializes a new instance of the ReconnectionInfo class.
    /// </summary>
    /// <param name="type">The type of reconnection that occurred.</param>
    public ReconnectionInfo(ReconnectionType type)
    {
        Type = type;
    }

    /// <summary>
    /// Gets the type of reconnection that occurred.
    /// </summary>
    public ReconnectionType Type { get; }

    /// <summary>
    /// Creates a new ReconnectionInfo instance with the specified reconnection type.
    /// </summary>
    /// <param name="type">The type of reconnection that occurred.</param>
    /// <returns>A new ReconnectionInfo instance.</returns>
    public static ReconnectionInfo Create(ReconnectionType type)
    {
        return new ReconnectionInfo(type);
    }
}
