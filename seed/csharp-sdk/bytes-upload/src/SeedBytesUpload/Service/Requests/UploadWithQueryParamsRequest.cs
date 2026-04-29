using global::System.Text.Json.Serialization;
using SeedBytesUpload.Core;

namespace SeedBytesUpload;

[Serializable]
public record UploadWithQueryParamsRequest
{
    /// <summary>
    /// The model to use for processing
    /// </summary>
    [JsonIgnore]
    public required string Model { get; set; }

    /// <summary>
    /// The language of the content
    /// </summary>
    [JsonIgnore]
    public string? Language { get; set; }

    [JsonIgnore]
    public required Stream Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
