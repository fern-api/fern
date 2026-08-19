using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record TestGetRequest
{
    [JsonIgnore]
    public string Region { get; set; } = "us-east-1";

    [JsonIgnore]
    public string? Limit { get; set; } = "100";

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
