using global::System.Text.Json.Serialization;
using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

[Serializable]
public record UploadBytesRequest
{
    [JsonIgnore]
    public required Stream Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
