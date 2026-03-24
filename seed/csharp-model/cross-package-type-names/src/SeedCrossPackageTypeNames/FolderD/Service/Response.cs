using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.FolderD;

[JsonConverter(typeof(Response.JsonConverter))]
[Serializable]
public record Response
{
    [JsonPropertyName("foo")]
    public SeedCrossPackageTypeNames.FolderB.Foo? Foo { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Response>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Response).IsAssignableFrom(typeToConvert);

        public override Response? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            SeedCrossPackageTypeNames.FolderB.Foo? _foo = default;
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
                    case "foo":
                        _foo = JsonSerializer.Deserialize<SeedCrossPackageTypeNames.FolderB.Foo?>(
                            ref reader,
                            options
                        );
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Response
            {
                Foo = _foo,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Response value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Foo != null)
            {
                writer.WritePropertyName("foo");
                JsonSerializer.Serialize(writer, value.Foo, options);
            }
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
