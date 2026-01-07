using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedExamples.Commons;
using SeedExamples.Core;

namespace SeedExamples;

[Serializable]
public record BigEntity : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [Optional]
    [JsonPropertyName("castMember")]
    public OneOf<Actor, Actress, StuntDouble>? CastMember { get; set; }

    [Optional]
    [JsonPropertyName("extendedMovie")]
    public ExtendedMovie? ExtendedMovie { get; set; }

    [Optional]
    [JsonPropertyName("entity")]
    public Entity? Entity { get; set; }

    [Optional]
    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [Optional]
    [JsonPropertyName("commonMetadata")]
    public Commons.Metadata? CommonMetadata { get; set; }

    [Optional]
    [JsonPropertyName("eventInfo")]
    public EventInfo? EventInfo { get; set; }

    [Optional]
    [JsonPropertyName("data")]
    public Data? Data { get; set; }

    [Optional]
    [JsonPropertyName("migration")]
    public Migration? Migration { get; set; }

    [Optional]
    [JsonPropertyName("exception")]
    public Exception? Exception { get; set; }

    [Optional]
    [JsonPropertyName("test")]
    public Test? Test { get; set; }

    [Optional]
    [JsonPropertyName("node")]
    public Node? Node { get; set; }

    [Optional]
    [JsonPropertyName("directory")]
    public Directory? Directory { get; set; }

    [Optional]
    [JsonPropertyName("moment")]
    public Moment? Moment { get; set; }

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
