using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;

namespace SeedExamples;

[Serializable]
public record BigEntity : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("castMember")]
    public OneOf<
        SeedExamples.Actor,
        SeedExamples.Actress,
        SeedExamples.StuntDouble
    >? CastMember { get; set; }

    [JsonPropertyName("extendedMovie")]
    public SeedExamples.ExtendedMovie? ExtendedMovie { get; set; }

    [JsonPropertyName("entity")]
    public SeedExamples.Entity? Entity { get; set; }

    [JsonPropertyName("metadata")]
    public SeedExamples.Metadata? Metadata { get; set; }

    [JsonPropertyName("commonMetadata")]
    public SeedExamples.Commons.Metadata? CommonMetadata { get; set; }

    [JsonPropertyName("eventInfo")]
    public SeedExamples.Commons.EventInfo? EventInfo { get; set; }

    [JsonPropertyName("data")]
    public SeedExamples.Commons.Data? Data { get; set; }

    [JsonPropertyName("migration")]
    public SeedExamples.Migration? Migration { get; set; }

    [JsonPropertyName("exception")]
    public SeedExamples.Exception? Exception { get; set; }

    [JsonPropertyName("test")]
    public SeedExamples.Test? Test { get; set; }

    [JsonPropertyName("node")]
    public SeedExamples.Node? Node { get; set; }

    [JsonPropertyName("directory")]
    public SeedExamples.Directory? Directory { get; set; }

    [JsonPropertyName("moment")]
    public SeedExamples.Moment? Moment { get; set; }

    [JsonIgnore]
    public SeedExamples.ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } =
        new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExamples.Core.JsonUtils.Serialize(this);
    }
}
