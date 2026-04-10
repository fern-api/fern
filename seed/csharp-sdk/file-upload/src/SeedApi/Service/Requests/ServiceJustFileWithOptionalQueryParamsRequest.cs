using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceJustFileWithOptionalQueryParamsRequest
{
    [JsonIgnore]
    public string? MaybeString { get; set; }

    [JsonIgnore]
    public int? MaybeInteger { get; set; }

    public FileParameter? File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
