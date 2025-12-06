using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record SendRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("prompt")]
    public string Prompt
    {
        get => "You are a helpful assistant";
        set =>
            value.Assert(
                value == "You are a helpful assistant",
                string.Format("'Prompt' must be {0}", "You are a helpful assistant")
            );
    }

    [JsonPropertyName("query")]
    public required string Query { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream
    {
        get => false;
        set => value.Assert(value == false, string.Format("'Stream' must be {0}", false));
    }

    [JsonPropertyName("ending")]
    public string Ending
    {
        get => "$ending";
        set => value.Assert(value == "$ending", string.Format("'Ending' must be {0}", "$ending"));
    }

    [JsonPropertyName("context")]
    public string Context
    {
        get => "You're super wise";
        set =>
            value.Assert(
                value == "You're super wise",
                string.Format("'Context' must be {0}", "You're super wise")
            );
    }

    [JsonPropertyName("maybeContext")]
    public string? MaybeContext { get; set; }

    [JsonPropertyName("containerObject")]
    public required ContainerObject ContainerObject { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
