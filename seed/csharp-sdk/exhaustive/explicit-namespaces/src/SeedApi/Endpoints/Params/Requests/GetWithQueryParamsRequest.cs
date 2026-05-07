using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Endpoints.Params;

[Serializable]
public record GetWithQueryParamsRequest
{
    [JsonIgnore]
    public required string Query { get; set; }

    [JsonIgnore]
    public required int Number { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
