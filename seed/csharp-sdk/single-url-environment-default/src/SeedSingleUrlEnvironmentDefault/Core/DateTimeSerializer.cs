using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedSingleUrlEnvironmentDefault.Core;

public class DateTimeSerializer : JsonConverter<DateTime>
{
    public override DateTime Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        return DateTime.ParseExact(reader.GetString()!, Constants.DateTimeFormat, null);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(Constants.DateTimeFormat));
    }
}
