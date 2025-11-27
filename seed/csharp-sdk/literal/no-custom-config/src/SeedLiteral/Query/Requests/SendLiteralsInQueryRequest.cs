using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record SendLiteralsInQueryRequest
{
    [JsonIgnore]
    public string Prompt { get; set; } = "You are a helpful assistant";

    [JsonIgnore]
    public string? OptionalPrompt { get; set; }

    [JsonIgnore]
    public string AliasPrompt { get; set; } = "You are a helpful assistant";

    [JsonIgnore]
    public string? AliasOptionalPrompt { get; set; }

    [JsonIgnore]
    public required string Query { get; set; }

    [JsonIgnore]
    public bool Stream { get; set; } = false;

    [JsonIgnore]
    public bool? OptionalStream { get; set; }

    [JsonIgnore]
    public bool AliasStream { get; set; } = false;

    [JsonIgnore]
    public bool? AliasOptionalStream { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
