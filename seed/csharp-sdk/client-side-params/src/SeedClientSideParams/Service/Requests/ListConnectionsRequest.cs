using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record ListConnectionsRequest
{
    /// <summary>
    /// Filter by strategy type (e.g., auth0, google-oauth2, samlp)
    /// </summary>
    [JsonIgnore]
    public string? Strategy { get; set; }

    /// <summary>
    /// Filter by connection name
    /// </summary>
    [JsonIgnore]
    public string? Name { get; set; }

    /// <summary>
    /// Comma-separated list of fields to include
    /// </summary>
    [JsonIgnore]
    public string? Fields { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
