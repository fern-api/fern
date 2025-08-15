using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record GetConnectionRequest
{
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
