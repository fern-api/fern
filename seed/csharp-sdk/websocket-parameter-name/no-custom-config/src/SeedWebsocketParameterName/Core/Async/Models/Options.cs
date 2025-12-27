using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace SeedWebsocketParameterName.Core.Async.Models;

/// <summary>
/// Abstract base class for asynchronous API configuration options.
/// Provides common configuration properties for WebSocket-based API connections.
/// </summary>
public abstract class AsyncApiOptions
{
    /// <summary>
    /// Gets or sets the base URL for the API connection.
    /// </summary>
    virtual public string BaseUrl { get; set; } = "";
}
