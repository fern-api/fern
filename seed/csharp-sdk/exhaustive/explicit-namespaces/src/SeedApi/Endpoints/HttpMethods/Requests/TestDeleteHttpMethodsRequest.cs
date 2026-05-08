using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Endpoints.HttpMethods;

[Serializable]
public record TestDeleteHttpMethodsRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
