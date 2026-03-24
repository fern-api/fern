using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(Account.JsonConverter))]
[Serializable]
public record Account
{
    [JsonPropertyName("resource_type")]
    public string ResourceType { get; set; } = "Account";

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("patient")]
    public Patient? Patient { get; set; }

    [JsonPropertyName("practitioner")]
    public Practitioner? Practitioner { get; set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("related_resources")]
    public IEnumerable<
        OneOf<Account, Patient, Practitioner, Script>
    > RelatedResources { get; set; } = new List<OneOf<Account, Patient, Practitioner, Script>>();

    [JsonPropertyName("memo")]
    public required Memo Memo { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Account>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Account).IsAssignableFrom(typeToConvert);

        public override Account? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            string _name = default;
            Patient? _patient = default;
            Practitioner? _practitioner = default;
            string _id = default;
            IEnumerable<OneOf<Account, Patient, Practitioner, Script>> _relatedResources = default;
            Memo _memo = default;
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
                    case "resource_type":
                        reader.Skip();
                        break;
                    case "name":
                        _name = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "patient":
                        _patient = JsonSerializer.Deserialize<Patient?>(ref reader, options);
                        break;
                    case "practitioner":
                        _practitioner = JsonSerializer.Deserialize<Practitioner?>(
                            ref reader,
                            options
                        );
                        break;
                    case "id":
                        _id = JsonSerializer.Deserialize<string>(ref reader, options);
                        break;
                    case "related_resources":
                        _relatedResources = JsonSerializer.Deserialize<
                            IEnumerable<OneOf<Account, Patient, Practitioner, Script>>
                        >(ref reader, options);
                        break;
                    case "memo":
                        _memo = JsonSerializer.Deserialize<Memo>(ref reader, options);
                        break;
                    default:
                        extensionData[propertyName!] = JsonElement.ParseValue(ref reader);
                        break;
                }
            }

            return new Account
            {
                Name = _name,
                Patient = _patient,
                Practitioner = _practitioner,
                Id = _id,
                RelatedResources = _relatedResources,
                Memo = _memo,
                AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Account value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStartObject();
            writer.WritePropertyName("resource_type");
            JsonSerializer.Serialize(writer, value.ResourceType, options);
            writer.WritePropertyName("name");
            JsonSerializer.Serialize(writer, value.Name, options);
            if (value.Patient != null)
            {
                writer.WritePropertyName("patient");
                JsonSerializer.Serialize(writer, value.Patient, options);
            }
            if (value.Practitioner != null)
            {
                writer.WritePropertyName("practitioner");
                JsonSerializer.Serialize(writer, value.Practitioner, options);
            }
            writer.WritePropertyName("id");
            JsonSerializer.Serialize(writer, value.Id, options);
            writer.WritePropertyName("related_resources");
            JsonSerializer.Serialize(writer, value.RelatedResources, options);
            writer.WritePropertyName("memo");
            JsonSerializer.Serialize(writer, value.Memo, options);
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

        public override Account ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = reader.GetString();
            return JsonSerializer.Deserialize<Account>(json, options);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Account value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.Serialize(value, options);
            writer.WritePropertyName(json);
        }
    }
}
