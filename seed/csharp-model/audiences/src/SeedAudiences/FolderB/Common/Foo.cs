using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedAudiences;
using SeedAudiences.Core;
using SeedAudiences.FolderC;

namespace SeedAudiences.FolderB;

[JsonConverter(typeof(Foo.JsonConverter))]
[Serializable]
public record Foo
{
    [JsonPropertyName("foo")]
    public FolderCFoo? Foo_ { get; set; }

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

            FolderCFoo? _foo_ = default;
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
                        _foo_ = JsonSerializer.Deserialize<FolderCFoo?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Foo
            {
                Foo_ = _foo_,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Foo value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            if (value.Foo_ != null)
            {
                writer.WritePropertyName("foo");
                JsonSerializer.Serialize(writer, value.Foo_, options);
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

        public override Foo ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Foo>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Foo value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
