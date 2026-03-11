using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(SendRequestEndingConverter))]
public readonly struct SendRequestEnding
{
    public const string Value = "$ending";

    public static implicit operator string(SendRequestEnding _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);

    public override bool Equals(object? obj) => obj is SendRequestEnding;

    public static bool operator ==(SendRequestEnding _, SendRequestEnding __) => true;

    public static bool operator !=(SendRequestEnding _, SendRequestEnding __) => false;

    internal sealed class SendRequestEndingConverter : JsonConverter<SendRequestEnding>
    {
        public override SendRequestEnding Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != SendRequestEnding.Value)
            {
                throw new JsonException(
                    $"Expected \"$ending\" for type discriminator but got \"{value}\"."
                );
            }
            return new SendRequestEnding();
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendRequestEnding value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(SendRequestEnding.Value);
    }
}
