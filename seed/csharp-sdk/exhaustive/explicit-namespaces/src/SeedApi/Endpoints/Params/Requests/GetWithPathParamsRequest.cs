using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Endpoints.Params;

[Serializable]
public record GetWithPathParamsRequest
{
    [JsonIgnore]
    public required string Param { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
