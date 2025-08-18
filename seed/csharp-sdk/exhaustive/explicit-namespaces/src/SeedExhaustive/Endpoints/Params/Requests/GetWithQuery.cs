using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

[System.Serializable]
public record GetWithQuery
{
    [System.Text.Json.Serialization.JsonIgnore]
    public required string Query { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public required int Number { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExhaustive.Core.JsonUtils.Serialize(this);
    }
}
