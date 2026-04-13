using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record FileServiceGetFileRequest
{
    /// <summary>
    /// This is a filename
    /// </summary>
    [JsonIgnore]
    public required string Filename { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
