using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.EndpointsHttpMethods;

[Serializable]
public record EndpointsHttpMethodsTestGetRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
