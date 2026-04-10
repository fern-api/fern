using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceJustFileWithQueryParamsRequest
{
    [JsonIgnore]
    public string? MaybeString { get; set; }

    [JsonIgnore]
    public required int Integer { get; set; }

    [JsonIgnore]
    public int? MaybeInteger { get; set; }

    [JsonIgnore]
    public IEnumerable<string> ListOfStrings { get; set; } = new List<string>();

    [JsonIgnore]
    public IEnumerable<string?> OptionalListOfStrings { get; set; } = new List<string?>();

    public FileParameter? File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
