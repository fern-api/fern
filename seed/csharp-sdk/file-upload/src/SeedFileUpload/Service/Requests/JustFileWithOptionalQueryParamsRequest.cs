using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record JustFileWithOptionalQueryParamsRequest
{
    [JsonIgnore]
    public string? MaybeString { get; set; }

    [JsonIgnore]
    public int? MaybeInteger { get; set; }

    public required FileParameter File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
