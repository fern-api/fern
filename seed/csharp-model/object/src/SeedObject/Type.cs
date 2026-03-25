using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

/// <summary>
/// Exercises all of the built-in types.
/// </summary>
[JsonConverter(typeof(Type.JsonConverter))]
[Serializable]
public record Type
{
    [JsonPropertyName("one")]
    public required int One { get; set; }

    [JsonPropertyName("two")]
    public required double Two { get; set; }

    [JsonPropertyName("three")]
    public required string Three { get; set; }

    [JsonPropertyName("four")]
    public required bool Four { get; set; }

    [JsonPropertyName("five")]
    public required long Five { get; set; }

    [JsonPropertyName("six")]
    public required DateTime Six { get; set; }

    [JsonPropertyName("seven")]
    public required DateOnly Seven { get; set; }

    [JsonPropertyName("eight")]
    public required string Eight { get; set; }

    [JsonPropertyName("nine")]
    public required string Nine { get; set; }

    [JsonPropertyName("ten")]
    public IEnumerable<int> Ten { get; set; } = new List<int>();

    [JsonPropertyName("eleven")]
    public HashSet<double> Eleven { get; set; } = new HashSet<double>();

    [JsonPropertyName("twelve")]
    public Dictionary<string, bool> Twelve { get; set; } = new Dictionary<string, bool>();

    [JsonPropertyName("thirteen")]
    public long? Thirteen { get; set; }

    [JsonPropertyName("fourteen")]
    public required object Fourteen { get; set; }

    [JsonPropertyName("fifteen")]
    public IEnumerable<IEnumerable<int>> Fifteen { get; set; } = new List<IEnumerable<int>>();

    [JsonPropertyName("sixteen")]
    public IEnumerable<Dictionary<string, int>> Sixteen { get; set; } =
        new List<Dictionary<string, int>>();

    [JsonPropertyName("seventeen")]
    public IEnumerable<string> Seventeen { get; set; } = new List<string>();

    [JsonPropertyName("eighteen")]
    public string Eighteen { get; set; } = "eighteen";

    [JsonPropertyName("nineteen")]
    public required Name Nineteen { get; set; }

    [JsonPropertyName("twenty")]
    public required uint Twenty { get; set; }

    [JsonPropertyName("twentyone")]
    public required ulong Twentyone { get; set; }

    [JsonPropertyName("twentytwo")]
    public required float Twentytwo { get; set; }

    [JsonPropertyName("twentythree")]
    public required string Twentythree { get; set; }

    [JsonPropertyName("twentyfour")]
    public DateTime? Twentyfour { get; set; }

    [JsonPropertyName("twentyfive")]
    public DateOnly? Twentyfive { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Type>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Type).IsAssignableFrom(typeToConvert);

        public override Type? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            int _one = default;
            double _two = default;
            string _three = default;
            bool _four = default;
            long _five = default;
            DateTime _six = default;
            DateOnly _seven = default;
            string _eight = default;
            string _nine = default;
            IEnumerable<int> _ten = default;
            HashSet<double> _eleven = default;
            Dictionary<string, bool> _twelve = default;
            long? _thirteen = default;
            object _fourteen = default;
            IEnumerable<IEnumerable<int>> _fifteen = default;
            IEnumerable<Dictionary<string, int>> _sixteen = default;
            IEnumerable<string> _seventeen = default;
            string _eighteen = default;
            Name _nineteen = default;
            uint _twenty = default;
            ulong _twentyone = default;
            float _twentytwo = default;
            string _twentythree = default;
            DateTime? _twentyfour = default;
            DateOnly? _twentyfive = default;
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
                    case "one":
                        _one = JsonSerializer.Deserialize<int>(ref reader, options);
                        break;
                    case "two":
                        _two = JsonSerializer.Deserialize<double>(ref reader, options);
                        break;
                    case "three":
                        _three = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "four":
                        _four = JsonSerializer.Deserialize<bool>(ref reader, options);
                        break;
                    case "five":
                        _five = JsonSerializer.Deserialize<long>(ref reader, options);
                        break;
                    case "six":
                        _six = JsonSerializer.Deserialize<DateTime>(ref reader, options);
                        break;
                    case "seven":
                        _seven = JsonSerializer.Deserialize<DateOnly>(ref reader, options);
                        break;
                    case "eight":
                        _eight = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "nine":
                        _nine = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "ten":
                        _ten = JsonSerializer.Deserialize<IEnumerable<int>>(ref reader, options);
                        break;
                    case "eleven":
                        _eleven = JsonSerializer.Deserialize<HashSet<double>>(ref reader, options);
                        break;
                    case "twelve":
                        _twelve = JsonSerializer.Deserialize<Dictionary<string, bool>>(
                            ref reader,
                            options
                        );
                        break;
                    case "thirteen":
                        _thirteen = JsonSerializer.Deserialize<long?>(ref reader, options);
                        break;
                    case "fourteen":
                        _fourteen = JsonSerializer.Deserialize<object>(ref reader, options);
                        break;
                    case "fifteen":
                        _fifteen = JsonSerializer.Deserialize<IEnumerable<IEnumerable<int>>>(
                            ref reader,
                            options
                        );
                        break;
                    case "sixteen":
                        _sixteen = JsonSerializer.Deserialize<IEnumerable<Dictionary<string, int>>>(
                            ref reader,
                            options
                        );
                        break;
                    case "seventeen":
                        _seventeen = JsonSerializer.Deserialize<IEnumerable<string>>(
                            ref reader,
                            options
                        );
                        break;
                    case "eighteen":
                        _eighteen = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "nineteen":
                        _nineteen = JsonSerializer.Deserialize<Name>(ref reader, options);
                        break;
                    case "twenty":
                        _twenty = JsonSerializer.Deserialize<uint>(ref reader, options);
                        break;
                    case "twentyone":
                        _twentyone = JsonSerializer.Deserialize<ulong>(ref reader, options);
                        break;
                    case "twentytwo":
                        _twentytwo = JsonSerializer.Deserialize<float>(ref reader, options);
                        break;
                    case "twentythree":
                        _twentythree = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "twentyfour":
                        _twentyfour = JsonSerializer.Deserialize<DateTime?>(ref reader, options);
                        break;
                    case "twentyfive":
                        _twentyfive = JsonSerializer.Deserialize<DateOnly?>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Type
            {
                One = _one,
                Two = _two,
                Three = _three,
                Four = _four,
                Five = _five,
                Six = _six,
                Seven = _seven,
                Eight = _eight,
                Nine = _nine,
                Ten = _ten,
                Eleven = _eleven,
                Twelve = _twelve,
                Thirteen = _thirteen,
                Fourteen = _fourteen,
                Fifteen = _fifteen,
                Sixteen = _sixteen,
                Seventeen = _seventeen,
                Eighteen = _eighteen,
                Nineteen = _nineteen,
                Twenty = _twenty,
                Twentyone = _twentyone,
                Twentytwo = _twentytwo,
                Twentythree = _twentythree,
                Twentyfour = _twentyfour,
                Twentyfive = _twentyfive,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(Utf8JsonWriter writer, Type value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WritePropertyName("one");
            JsonSerializer.Serialize(writer, value.One, options);
            writer.WritePropertyName("two");
            JsonSerializer.Serialize(writer, value.Two, options);
            writer.WritePropertyName("three");
            JsonSerializer.Serialize(writer, value.Three, options);
            writer.WritePropertyName("four");
            JsonSerializer.Serialize(writer, value.Four, options);
            writer.WritePropertyName("five");
            JsonSerializer.Serialize(writer, value.Five, options);
            writer.WritePropertyName("six");
            JsonSerializer.Serialize(writer, value.Six, options);
            writer.WritePropertyName("seven");
            JsonSerializer.Serialize(writer, value.Seven, options);
            writer.WritePropertyName("eight");
            JsonSerializer.Serialize(writer, value.Eight, options);
            writer.WritePropertyName("nine");
            JsonSerializer.Serialize(writer, value.Nine, options);
            writer.WritePropertyName("ten");
            JsonSerializer.Serialize(writer, value.Ten, options);
            writer.WritePropertyName("eleven");
            JsonSerializer.Serialize(writer, value.Eleven, options);
            writer.WritePropertyName("twelve");
            JsonSerializer.Serialize(writer, value.Twelve, options);
            if (value.Thirteen != null)
            {
                writer.WritePropertyName("thirteen");
                JsonSerializer.Serialize(writer, value.Thirteen, options);
            }
            writer.WritePropertyName("fourteen");
            JsonSerializer.Serialize(writer, value.Fourteen, options);
            writer.WritePropertyName("fifteen");
            JsonSerializer.Serialize(writer, value.Fifteen, options);
            writer.WritePropertyName("sixteen");
            JsonSerializer.Serialize(writer, value.Sixteen, options);
            writer.WritePropertyName("seventeen");
            JsonSerializer.Serialize(writer, value.Seventeen, options);
            writer.WritePropertyName("eighteen");
            JsonSerializer.Serialize(writer, value.Eighteen, options);
            writer.WritePropertyName("nineteen");
            JsonSerializer.Serialize(writer, value.Nineteen, options);
            writer.WritePropertyName("twenty");
            JsonSerializer.Serialize(writer, value.Twenty, options);
            writer.WritePropertyName("twentyone");
            JsonSerializer.Serialize(writer, value.Twentyone, options);
            writer.WritePropertyName("twentytwo");
            JsonSerializer.Serialize(writer, value.Twentytwo, options);
            writer.WritePropertyName("twentythree");
            JsonSerializer.Serialize(writer, value.Twentythree, options);
            if (value.Twentyfour != null)
            {
                writer.WritePropertyName("twentyfour");
                JsonSerializer.Serialize(writer, value.Twentyfour, options);
            }
            if (value.Twentyfive != null)
            {
                writer.WritePropertyName("twentyfive");
                JsonSerializer.Serialize(writer, value.Twentyfive, options);
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

        public override Type ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Type>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Type value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
