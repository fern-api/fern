using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedValidation.Core;

internal class DateTimeSerializer : JsonConverter<DateTime>
{
    public override DateTime Read(
        ref Utf8JsonReader reader,
        System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        return DateTime.Parse(reader.GetString()!, null, DateTimeStyles.RoundtripKind);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(Constants.DateTimeFormat));
    }
}
