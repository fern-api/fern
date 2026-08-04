using global::System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

[Serializable]
public record UploadBytesWithQuery
{
    [JsonIgnore]
    public string? Fields { get; set; }

    [JsonIgnore]
    public required Stream Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
