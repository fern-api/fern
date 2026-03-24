using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

[JsonConverter(typeof(ObjectWithOptionalField.JsonConverter))]
[Serializable]
public record ObjectWithOptionalField
{
    /// <summary>
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    /// </summary>
    [JsonPropertyName("string")]
    public string? String { get; set; }

    [JsonPropertyName("integer")]
    public int? Integer { get; set; }

    [JsonPropertyName("long")]
    public long? Long { get; set; }

    [JsonPropertyName("double")]
    public double? Double { get; set; }

    [JsonPropertyName("bool")]
    public bool? Bool { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime? Datetime { get; set; }

    [JsonPropertyName("date")]
    public DateOnly? Date { get; set; }

    [JsonPropertyName("uuid")]
    public string? Uuid { get; set; }

    [JsonPropertyName("base64")]
    public string? Base64 { get; set; }

    [JsonPropertyName("list")]
    public IEnumerable<string>? List { get; set; }

    [JsonPropertyName("set")]
    public HashSet<string>? Set { get; set; }

    [JsonPropertyName("map")]
    public Dictionary<int, string>? Map { get; set; }

    [JsonPropertyName("bigint")]
    public string? Bigint { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ObjectWithOptionalField>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ObjectWithOptionalField).IsAssignableFrom(typeToConvert);

        public override ObjectWithOptionalField? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string? _string = default;
            int? _integer = default;
            long? _long = default;
            double? _double = default;
            bool? _bool = default;
            DateTime? _datetime = default;
            DateOnly? _date = default;
            string? _uuid = default;
            string? _base64 = default;
            IEnumerable<string>? _list = default;
            HashSet<string>? _set = default;
            Dictionary<int, string>? _map = default;
            string? _bigint = default;
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
                    case "string":
                        _string = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "integer":
                        _integer = JsonSerializer.Deserialize<int?>(ref reader, options);
                        break;
                    case "long":
                        _long = JsonSerializer.Deserialize<long?>(ref reader, options);
                        break;
                    case "double":
                        _double = JsonSerializer.Deserialize<double?>(ref reader, options);
                        break;
                    case "bool":
                        _bool = JsonSerializer.Deserialize<bool?>(ref reader, options);
                        break;
                    case "datetime":
                        _datetime = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "date":
                        _date = JsonSerializer.Deserialize<DateOnly?>(ref reader, options);
                        break;
                    case "uuid":
                        _uuid = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "base64":
                        _base64 = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    case "list":
                        _list = JsonSerializer.Deserialize<IEnumerable<string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "set":
                        _set = JsonSerializer.Deserialize<HashSet<string>?>(ref reader, options);
                        break;
                    case "map":
                        _map = JsonSerializer.Deserialize<Dictionary<int, string>?>(
                            ref reader,
                            options
                        );
                        break;
                    case "bigint":
                        _bigint = JsonSerializer.Deserialize<string?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new ObjectWithOptionalField
            {
                String = _string,
                Integer = _integer,
                Long = _long,
                Double = _double,
                Bool = _bool,
                Datetime = _datetime,
                Date = _date,
                Uuid = _uuid,
                Base64 = _base64,
                List = _list,
                Set = _set,
                Map = _map,
                Bigint = _bigint,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            ObjectWithOptionalField value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            if (value.String != null)
            {
                writer.WritePropertyName("string");
                JsonSerializer.Serialize(writer, value.String, options);
            }
            if (value.Integer != null)
            {
                writer.WritePropertyName("integer");
                JsonSerializer.Serialize(writer, value.Integer, options);
            }
            if (value.Long != null)
            {
                writer.WritePropertyName("long");
                JsonSerializer.Serialize(writer, value.Long, options);
            }
            if (value.Double != null)
            {
                writer.WritePropertyName("double");
                JsonSerializer.Serialize(writer, value.Double, options);
            }
            if (value.Bool != null)
            {
                writer.WritePropertyName("bool");
                JsonSerializer.Serialize(writer, value.Bool, options);
            }
            if (value.Datetime != null)
            {
                writer.WritePropertyName("datetime");
                JsonSerializer.Serialize(writer, value.Datetime, options);
            }
            if (value.Date != null)
            {
                writer.WritePropertyName("date");
                JsonSerializer.Serialize(writer, value.Date, options);
            }
            if (value.Uuid != null)
            {
                writer.WritePropertyName("uuid");
                JsonSerializer.Serialize(writer, value.Uuid, options);
            }
            if (value.Base64 != null)
            {
                writer.WritePropertyName("base64");
                JsonSerializer.Serialize(writer, value.Base64, options);
            }
            if (value.List != null)
            {
                writer.WritePropertyName("list");
                JsonSerializer.Serialize(writer, value.List, options);
            }
            if (value.Set != null)
            {
                writer.WritePropertyName("set");
                JsonSerializer.Serialize(writer, value.Set, options);
            }
            if (value.Map != null)
            {
                writer.WritePropertyName("map");
                JsonSerializer.Serialize(writer, value.Map, options);
            }
            if (value.Bigint != null)
            {
                writer.WritePropertyName("bigint");
                JsonSerializer.Serialize(writer, value.Bigint, options);
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

        public override ObjectWithOptionalField ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ObjectWithOptionalField value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
