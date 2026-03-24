using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(DescribeResponse.JsonConverter))]
[Serializable]
public record DescribeResponse
{
    [JsonPropertyName("namespaces")]
    public Dictionary<string, NamespaceSummary>? Namespaces { get; set; }

    [JsonPropertyName("dimension")]
    public uint? Dimension { get; set; }

    [JsonPropertyName("fullness")]
    public float? Fullness { get; set; }

    [JsonPropertyName("total_count")]
    public uint? TotalCount { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new DescribeResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static DescribeResponse FromProto(ProtoDataV1Grpc.DescribeResponse value)
    {
        return new DescribeResponse
        {
            Namespaces = value.Namespaces?.ToDictionary(
                kvp => kvp.Key,
                kvp => SeedApi.NamespaceSummary.FromProto(kvp.Value)
            ),
            Dimension = value.Dimension,
            Fullness = value.Fullness,
            TotalCount = value.TotalCount,
        };
    }

    /// <summary>
    /// Maps the DescribeResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.DescribeResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.DescribeResponse();
        if (Namespaces != null && Namespaces.Any())
        {
            foreach (var kvp in Namespaces)
            {
                result.Namespaces.Add(kvp.Key, kvp.Value.ToProto());
            }
            ;
        }
        if (Dimension != null)
        {
            result.Dimension = Dimension ?? 0;
        }
        if (Fullness != null)
        {
            result.Fullness = Fullness ?? 0.0f;
        }
        if (TotalCount != null)
        {
            result.TotalCount = TotalCount ?? 0;
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DescribeResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DescribeResponse).IsAssignableFrom(typeToConvert);

        public override DescribeResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Dictionary<string, NamespaceSummary>? _namespaces = default;
            uint? _dimension = default;
            float? _fullness = default;
            uint? _totalCount = default;
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
                    case "namespaces":
                        _namespaces = JsonSerializer.Deserialize<Dictionary<
                            string,
                            NamespaceSummary
                        >?>(ref reader, options);
                        break;
                    case "dimension":
                        _dimension = JsonSerializer.Deserialize<uint?>(ref reader, options);
                        break;
                    case "fullness":
                        _fullness = JsonSerializer.Deserialize<float?>(ref reader, options);
                        break;
                    case "total_count":
                        _totalCount = JsonSerializer.Deserialize<uint?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new DescribeResponse
            {
                Namespaces = _namespaces,
                Dimension = _dimension,
                Fullness = _fullness,
                TotalCount = _totalCount,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            DescribeResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Namespaces != null)
            {
                writer.WritePropertyName("namespaces");
                JsonSerializer.Serialize(writer, value.Namespaces, options);
            }
            if (value.Dimension != null)
            {
                writer.WritePropertyName("dimension");
                JsonSerializer.Serialize(writer, value.Dimension, options);
            }
            if (value.Fullness != null)
            {
                writer.WritePropertyName("fullness");
                JsonSerializer.Serialize(writer, value.Fullness, options);
            }
            if (value.TotalCount != null)
            {
                writer.WritePropertyName("total_count");
                JsonSerializer.Serialize(writer, value.TotalCount, options);
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
