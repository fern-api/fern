using System.Text.Json.Serialization;
using SeedClientSideParams.Core;

namespace SeedClientSideParams;

[Serializable]
public record GetResourceRequest
{
    /// <summary>
    /// Include metadata in response
    /// </summary>
    [JsonIgnore]
    public required bool IncludeMetadata { get; set; }

    /// <summary>
    /// Response format
    /// </summary>
    [JsonIgnore]
    public required string Format { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
