namespace SeedWebsocket.Core.WebSockets;

/// <summary>
/// Event arguments for when the connection with the async service is closed.
/// </summary>
public sealed class Closed
{
    /// <summary>
    /// The close event code.
    /// </summary>
    public int? Code { get; internal set; }

    /// <summary>
    /// The close event reason text.
    /// </summary>
    public string? Reason { get; internal set; }
}
