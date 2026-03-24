using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(FetchResponse.JsonConverter))]
[Serializable]
public record FetchResponse
{
    [JsonPropertyName("columns")]
    public Dictionary<string, Column>? Columns { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("usage")]
    public Usage? Usage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new FetchResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static FetchResponse FromProto(ProtoDataV1Grpc.FetchResponse value)
    {
        return new FetchResponse
        {
            Columns = value.Columns?.ToDictionary(
                kvp => kvp.Key,
                kvp => SeedApi.Column.FromProto(kvp.Value)
            ),
            Namespace = value.Namespace,
            Usage = value.Usage != null ? SeedApi.Usage.FromProto(value.Usage) : null,
        };
    }

    /// <summary>
    /// Maps the FetchResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.FetchResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.FetchResponse();
        if (Columns != null && Columns.Any())
        {
            foreach (var kvp in Columns)
            {
                result.Columns.Add(kvp.Key, kvp.Value.ToProto());
            }
            ;
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (Usage != null)
        {
            result.Usage = Usage.ToProto();
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<FetchResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(FetchResponse).IsAssignableFrom(typeToConvert);

        public override FetchResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Dictionary<string, Column>? _columns = default;
            string? _namespace = default;
            Usage? _usage = default;
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
                    case "columns":
                        _columns = JsonSerializer.Deserialize<Dictionary<string, Column>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "namespace":
                        _namespace = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "usage":
                        _usage = JsonSerializer.Deserialize<Usage?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new FetchResponse
            {
                Columns = _columns,
                Namespace = _namespace,
                Usage = _usage,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            FetchResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Columns != null)
            {
                writer.WritePropertyName("columns");
                JsonSerializer.Serialize(writer, value.Columns, options);
            }
            if (value.Namespace != null)
            {
                writer.WritePropertyName("namespace");
                JsonSerializer.Serialize(writer, value.Namespace, options);
            }
            if (value.Usage != null)
            {
                writer.WritePropertyName("usage");
                JsonSerializer.Serialize(writer, value.Usage, options);
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
