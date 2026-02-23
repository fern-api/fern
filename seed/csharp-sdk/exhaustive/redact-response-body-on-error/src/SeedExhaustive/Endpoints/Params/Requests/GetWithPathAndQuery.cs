using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

[Serializable]
public record GetWithPathAndQuery
{
    [JsonIgnore]
    public required string Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
