using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderC;

[JsonConverter(typeof(Foo.JsonConverter))]
[Serializable]
public record Foo
{
    [JsonPropertyName("bar_property")]
    public required string BarProperty { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Foo>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Foo).IsAssignableFrom(typeToConvert);

        public override Foo? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _barProperty = default;
            var extensionData = new Dictionary<string, JsonElement>();

            if (reader.TokenType != JsonTokenType.StartObject)
            {
                throw new JsonException("Expected StartObject");
            }

            while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)
            {
                var propertyName = reader.GetString();
                reader.Read();

                switch (propertyName)
                {
                    case "bar_property":
                        _barProperty = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Foo
            {
                BarProperty = _barProperty,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Foo value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("bar_property");
            JsonSerializer.Serialize(writer, value.BarProperty, options);
            if (value.AdditionalProperties != null)
            {
                foreach (var kvp in value.AdditionalProperties)
                {
                    writer.WritePropertyName(kvp.Key);
                    kvp.Value.WriteTo(writer);
                }
            }
            writer.WriteEndObject();
        }
    }
}
