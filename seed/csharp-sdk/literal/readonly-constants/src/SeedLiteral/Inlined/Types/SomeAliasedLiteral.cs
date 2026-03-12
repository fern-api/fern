using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(SomeAliasedLiteralConverter))]
public readonly struct SomeAliasedLiteral
{
    public const string Value = "You're super wise";

    public static implicit operator string(SomeAliasedLiteral _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => Value.GetHashCode(global::System.StringComparison.Ordinal);

    public override bool Equals(object? obj) => obj is SomeAliasedLiteral;

    public static bool operator ==(SomeAliasedLiteral _, SomeAliasedLiteral __) => true;

    public static bool operator !=(SomeAliasedLiteral _, SomeAliasedLiteral __) => false;

    internal sealed class SomeAliasedLiteralConverter : JsonConverter<SomeAliasedLiteral>
    {
        public override SomeAliasedLiteral Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != SomeAliasedLiteral.Value)
            {
                throw new JsonException(
                    "Expected \""
                        + SomeAliasedLiteral.Value
                        + "\" for type discriminator but got \""
                        + value
                        + "\"."
                );
            }
            return new SomeAliasedLiteral();
        }

        public override void Write(
            Utf8JsonWriter writer,
            SomeAliasedLiteral value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(SomeAliasedLiteral.Value);
    }
}
