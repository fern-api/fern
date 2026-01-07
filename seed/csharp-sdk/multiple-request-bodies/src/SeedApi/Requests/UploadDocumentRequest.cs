using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UploadDocumentRequest
{
    [Optional]
    [JsonPropertyName("author")]
    public string? Author { get; set; }

    [Optional]
    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [Optional]
    [JsonPropertyName("title")]
    public string? Title { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
