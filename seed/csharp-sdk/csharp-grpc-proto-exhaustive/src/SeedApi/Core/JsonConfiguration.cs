using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedApi.Core;

internal static partial class JsonOptions
{
    public static readonly JsonSerializerOptions JsonSerializerOptions;

    static JsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            Converters =
            {
                new DateTimeSerializer(),
#if USE_PORTABLE_DATE_ONLY
                new DateOnlyConverter(),
#endif
                new OneOfSerializer(),
            },
            WriteIndented = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };
        ConfigureJsonSerializerOptions(options);
        JsonSerializerOptions = options;
    }

    static partial void ConfigureJsonSerializerOptions(JsonSerializerOptions defaultOptions);
}

internal static class JsonUtils
{
    public static string Serialize<T>(T obj)
    {
        return JsonSerializer.Serialize(obj, JsonOptions.JsonSerializerOptions);
    }

    public static string SerializeAsString<T>(T obj)
    {
        var json = JsonSerializer.Serialize(obj, JsonOptions.JsonSerializerOptions);
        return json.Trim('"');
    }

    public static T Deserialize<T>(string json)
    {
        return JsonSerializer.Deserialize<T>(json, JsonOptions.JsonSerializerOptions)!;
    }
}
