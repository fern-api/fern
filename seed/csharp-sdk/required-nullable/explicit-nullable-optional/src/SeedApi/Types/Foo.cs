using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(Foo.JsonConverter))]
[Serializable]
public record Foo
{
    [Optional]
    [JsonPropertyName("bar")]
    public string? Bar { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nullable_bar")]
    public Optional<string?> NullableBar { get; set; }

    [Nullable]
    [JsonPropertyName("nullable_required_bar")]
    public string? NullableRequiredBar { get; set; }

    [JsonPropertyName("required_bar")]
    public required string RequiredBar { get; set; }

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

            string? _bar = default;
            var _nullableBar = Optional<string?>.Undefined;
            string? _nullableRequiredBar = default;
            string _requiredBar = default;
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
                    case "bar":
                        _bar = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "nullable_bar":
                        _nullableBar = Optional<string?>.Of(
                            JsonSerializer.Deserialize<string?>(ref reader, options)
                        );
                        break;
                    case "nullable_required_bar":
                        _nullableRequiredBar = JsonSerializer.Deserialize<string?>(
                            ref reader,
                            options
                        );
                        break;
                    case "required_bar":
                        _requiredBar = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Foo
            {
                Bar = _bar,
                NullableBar = _nullableBar,
                NullableRequiredBar = _nullableRequiredBar,
                RequiredBar = _requiredBar,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Foo value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            if (value.Bar != null)
            {
                writer.WritePropertyName("bar");
                JsonSerializer.Serialize(writer, value.Bar, options);
            }
            if (value.NullableBar.IsDefined)
            {
                writer.WritePropertyName("nullable_bar");
                JsonSerializer.Serialize(writer, value.NullableBar.Value, options);
            }
            writer.WritePropertyName("nullable_required_bar");
            JsonSerializer.Serialize(writer, value.NullableRequiredBar, options);
            writer.WritePropertyName("required_bar");
            JsonSerializer.Serialize(writer, value.RequiredBar, options);
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
