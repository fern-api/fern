using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[JsonConverter(typeof(CreateResponse.JsonConverter))]
[Serializable]
public record CreateResponse
{
    /// <summary>
    /// The created resource.
    /// </summary>
    [JsonPropertyName("resource")]
    public Column? Resource { get; set; }

    /// <summary>
    /// Indicates successful creation.
    /// </summary>
    [JsonPropertyName("success")]
    public bool? Success { get; set; }

    /// <summary>
    /// Error message if creation failed.
    /// </summary>
    [JsonPropertyName("error_message")]
    public string? ErrorMessage { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <summary>
    /// Returns a new CreateResponse type from its Protobuf-equivalent representation.
    /// </summary>
    internal static CreateResponse FromProto(ProtoDataV1Grpc.CreateResponse value)
    {
        return new CreateResponse
        {
            Resource = value.Resource != null ? SeedApi.Column.FromProto(value.Resource) : null,
            Success = value.Success,
            ErrorMessage = value.ErrorMessage,
        };
    }

    /// <summary>
    /// Maps the CreateResponse type into its Protobuf-equivalent representation.
    /// </summary>
    internal ProtoDataV1Grpc.CreateResponse ToProto()
    {
        var result = new ProtoDataV1Grpc.CreateResponse();
        if (Resource != null)
        {
            result.Resource = Resource.ToProto();
        }
        if (Success != null)
        {
            result.Success = Success ?? false;
        }
        if (ErrorMessage != null)
        {
            result.ErrorMessage = ErrorMessage ?? "";
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CreateResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CreateResponse).IsAssignableFrom(typeToConvert);

        public override CreateResponse? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            Column? _resource = default;
            bool? _success = default;
            string? _errorMessage = default;
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
                    case "resource":
                        _resource = JsonSerializer.Deserialize<Column?>(ref reader, options);
                        break;
                    case "success":
                        _success = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "error_message":
                        _errorMessage = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new CreateResponse
            {
                Resource = _resource,
                Success = _success,
                ErrorMessage = _errorMessage,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            CreateResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.Resource != null)
            {
                writer.WritePropertyName("resource");
                JsonSerializer.Serialize(writer, value.Resource, options);
            }
            if (value.Success != null)
            {
                writer.WritePropertyName("success");
                JsonSerializer.Serialize(writer, value.Success, options);
            }
            if (value.ErrorMessage != null)
            {
                writer.WritePropertyName("error_message");
                JsonSerializer.Serialize(writer, value.ErrorMessage, options);
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

        public override CreateResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<CreateResponse>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CreateResponse value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
