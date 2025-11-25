using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedHeaderTokenEnvironmentVariable.Core;

internal class DateTimeSerializer : JsonConverter<DateTime>
{
    public override DateTime Read(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
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
