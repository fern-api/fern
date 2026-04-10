using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record EndpointsParamsModifyWithInlinePathRequest
{
    [JsonIgnore]
    public required string Param { get; set; }

    [JsonIgnore]
    public required string Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
