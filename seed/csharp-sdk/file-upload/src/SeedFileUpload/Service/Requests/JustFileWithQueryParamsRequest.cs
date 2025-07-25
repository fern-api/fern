using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

[Serializable]
public record JustFileWithQueryParamsRequest
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
    public IEnumerable<string> OptionalListOfStrings { get; set; } = new List<string>();

    public required FileParameter File { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
