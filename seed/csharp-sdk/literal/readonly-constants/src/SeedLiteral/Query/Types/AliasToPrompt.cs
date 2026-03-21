using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(AliasToPromptConverter))]
public readonly struct AliasToPrompt
{
    public const string Value = "You are a helpful assistant";

    public static implicit operator string(AliasToPrompt _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => global::System.StringComparer.Ordinal.GetHashCode(Value);

    public override bool Equals(object? obj) => obj is AliasToPrompt;

    public static bool operator ==(AliasToPrompt _, AliasToPrompt __) => true;

    public static bool operator !=(AliasToPrompt _, AliasToPrompt __) => false;

    internal sealed class AliasToPromptConverter : JsonConverter<AliasToPrompt>
    {
        public override AliasToPrompt Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != AliasToPrompt.Value)
            {
                throw new JsonException(
                    "Expected \""
                        + AliasToPrompt.Value
                        + "\" for type discriminator but got \""
                        + value
                        + "\"."
                );
            }
            return new AliasToPrompt();
        }

        public override void Write(
            Utf8JsonWriter writer,
            AliasToPrompt value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(AliasToPrompt.Value);

        public override AliasToPrompt ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != AliasToPrompt.Value)
            {
                throw new JsonException(
                    "Expected \""
                        + AliasToPrompt.Value
                        + "\" for type discriminator but got \""
                        + value
                        + "\"."
                );
            }
            return new AliasToPrompt();
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AliasToPrompt value,
            JsonSerializerOptions options
        ) => writer.WritePropertyName(AliasToPrompt.Value);
    }
}
