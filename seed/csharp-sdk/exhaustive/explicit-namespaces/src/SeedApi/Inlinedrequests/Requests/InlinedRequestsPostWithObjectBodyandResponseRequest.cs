using global::System.Text.Json.Serialization;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Inlinedrequests;

[Serializable]
public record InlinedRequestsPostWithObjectBodyandResponseRequest
{
    [JsonPropertyName("string")]
    public required string String { get; set; }

    [JsonPropertyName("integer")]
    public required int Integer { get; set; }

    [JsonPropertyName("NestedObject")]
    public required TypesObjectWithOptionalField NestedObject { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
