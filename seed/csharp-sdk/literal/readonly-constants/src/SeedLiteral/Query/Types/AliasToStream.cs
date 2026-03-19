using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(AliasToStreamConverter))]
public readonly struct AliasToStream
{
    public const bool Value = false;

    public static implicit operator bool(AliasToStream _) => Value;

    public override string ToString() => Value.ToString();

    public override int GetHashCode() => Value.GetHashCode();

    public override bool Equals(object? obj) => obj is AliasToStream;

    public static bool operator ==(AliasToStream _, AliasToStream __) => true;

    public static bool operator !=(AliasToStream _, AliasToStream __) => false;

    internal sealed class AliasToStreamConverter : JsonConverter<AliasToStream>
    {
        public override AliasToStream Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetBoolean();
            if (value != AliasToStream.Value)
            {
                throw new JsonException("Expected false for type discriminator but got true.");
            }
            return new AliasToStream();
        }

        public override void Write(
            Utf8JsonWriter writer,
            AliasToStream value,
            JsonSerializerOptions options
        ) => writer.WriteBooleanValue(AliasToStream.Value);

        public override AliasToStream ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (!bool.TryParse(value, out var boolValue) || boolValue != AliasToStream.Value)
            {
                throw new JsonException(
                    "Expected false for type discriminator but got \"" + value + "\"."
                );
            }
            return new AliasToStream();
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            AliasToStream value,
            JsonSerializerOptions options
        ) => writer.WritePropertyName(AliasToStream.Value.ToString());
    }
}
