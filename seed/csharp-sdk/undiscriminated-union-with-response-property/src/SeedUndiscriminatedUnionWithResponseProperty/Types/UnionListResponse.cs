using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedUndiscriminatedUnionWithResponseProperty.Core;

namespace SeedUndiscriminatedUnionWithResponseProperty;

[JsonConverter(typeof(UnionListResponse.JsonConverter))]
[Serializable]
public record UnionListResponse
{
    [JsonPropertyName("data")]
    public IEnumerable<OneOf<VariantA, VariantB, VariantC>> Data { get; set; } =
        new List<OneOf<VariantA, VariantB, VariantC>>();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionListResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionListResponse).IsAssignableFrom(typeToConvert);

        public override UnionListResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            IEnumerable<OneOf<VariantA, VariantB, VariantC>> _data = default;
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
                    case "data":
                        _data = JsonSerializer.Deserialize<
                            IEnumerable<OneOf<VariantA, VariantB, VariantC>>
                        >(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new UnionListResponse
            {
                Data = _data,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionListResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("data");
            JsonSerializer.Serialize(writer, value.Data, options);
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

        public override UnionListResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<UnionListResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionListResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
