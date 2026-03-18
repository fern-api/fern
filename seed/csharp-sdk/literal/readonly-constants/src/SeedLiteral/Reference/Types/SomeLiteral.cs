using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(SomeLiteralConverter))]
public readonly struct SomeLiteral
{
    public const string Value = "You're super wise";

    public static implicit operator string(SomeLiteral _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => global::System.StringComparer.Ordinal.GetHashCode(Value);

    public override bool Equals(object? obj) => obj is SomeLiteral;

    public static bool operator ==(SomeLiteral _, SomeLiteral __) => true;

    public static bool operator !=(SomeLiteral _, SomeLiteral __) => false;

    internal sealed class SomeLiteralConverter : JsonConverter<SomeLiteral>
    {
        public override SomeLiteral Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != SomeLiteral.Value)
            {
                throw new JsonException(
                    "Expected \""
                        + SomeLiteral.Value
                        + "\" for type discriminator but got \""
                        + value
                        + "\"."
                );
            }
            return new SomeLiteral();
        }

        public override void Write(
            Utf8JsonWriter writer,
            SomeLiteral value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(SomeLiteral.Value);
    }
}
