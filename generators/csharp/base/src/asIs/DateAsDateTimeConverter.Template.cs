using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace <%= namespace%>;

internal class DateAsDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var dateString = reader.GetString();
        if (DateTime.TryParse(dateString, out var dateTime))
        {
            return dateTime;
        }
        throw new JsonException($"Unable to convert \"{dateString}\" to DateTime.");
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
internal class DateAsDateTimeAttribute() : JsonConverterAttribute(typeof(DateAsDateTimeConverter));
