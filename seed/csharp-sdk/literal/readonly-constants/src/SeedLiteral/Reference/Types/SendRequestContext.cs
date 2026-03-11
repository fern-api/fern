using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedLiteral;

[JsonConverter(typeof(SendRequestContextConverter))]
public readonly struct SendRequestContext
{
    public const string Value = "You're super wise";

    public static implicit operator string(SendRequestContext _) => Value;

    public override string ToString() => Value;

    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);

    public override bool Equals(object? obj) => obj is SendRequestContext;

    public static bool operator ==(SendRequestContext _, SendRequestContext __) => true;

    public static bool operator !=(SendRequestContext _, SendRequestContext __) => false;

    internal sealed class SendRequestContextConverter : JsonConverter<SendRequestContext>
    {
        public override SendRequestContext Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != SendRequestContext.Value)
            {
                throw new JsonException(
                    "Expected \""
                        + SendRequestContext.Value
                        + "\" for type discriminator but got \""
                        + value
                        + "\"."
                );
            }
            return new SendRequestContext();
        }

        public override void Write(
            Utf8JsonWriter writer,
            SendRequestContext value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(SendRequestContext.Value);
    }
}
