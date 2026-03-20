using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record SendResponse : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("message")]
    public required string Message { get; set; }

    [JsonPropertyName("status")]
    public required int Status { get; set; }

    [JsonRequired]
    [JsonPropertyName("success")]
    public SendResponse.SuccessLiteral Success { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    } = new();

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    [JsonConverter(typeof(SuccessLiteralConverter))]
    public readonly struct SuccessLiteral
    {
        public const bool Value = true;

        public static implicit operator bool(SuccessLiteral _) => Value;

        public override string ToString() => Value.ToString();

        public override int GetHashCode() => Value.GetHashCode();

        public override bool Equals(object? obj) => obj is SuccessLiteral;

        public static bool operator ==(SuccessLiteral _, SuccessLiteral __) => true;

        public static bool operator !=(SuccessLiteral _, SuccessLiteral __) => false;

        internal sealed class SuccessLiteralConverter : JsonConverter<SuccessLiteral>
        {
            public override SuccessLiteral Read(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetBoolean();
                if (value != SuccessLiteral.Value)
                {
                    throw new JsonException("Expected true for type discriminator but got false.");
                }
                return new SuccessLiteral();
            }

            public override void Write(
                Utf8JsonWriter writer,
                SuccessLiteral value,
                JsonSerializerOptions options
            ) => writer.WriteBooleanValue(SuccessLiteral.Value);

            public override SuccessLiteral ReadAsPropertyName(
                ref Utf8JsonReader reader,
                global::System.Type typeToConvert,
                JsonSerializerOptions options
            )
            {
                var value = reader.GetString();
                if (!bool.TryParse(value, out var boolValue) || boolValue != SuccessLiteral.Value)
                {
                    throw new JsonException(
                        "Expected true for type discriminator but got \"" + value + "\"."
                    );
                }
                return new SuccessLiteral();
            }

            public override void WriteAsPropertyName(
                Utf8JsonWriter writer,
                SuccessLiteral value,
                JsonSerializerOptions options
            ) => writer.WritePropertyName(SuccessLiteral.Value.ToString());
        }
    }
}
