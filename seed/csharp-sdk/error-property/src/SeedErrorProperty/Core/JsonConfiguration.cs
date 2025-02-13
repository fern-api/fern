using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeedErrorProperty.Core;

internal static partial class JsonOptions
{
    public static readonly JsonSerializerOptions JsonSerializerOptions;
    public static readonly JsonSerializerOptions JsonSerializerOptionsWithFallback;

    static JsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            Converters = { new DateTimeSerializer(), new OneOfSerializer() },
            WriteIndented = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };
        ConfigureJsonSerializerOptions(options);
        JsonSerializerOptions = options;

        JsonSerializerOptionsWithFallback = new JsonSerializerOptions(options)
        {
            TypeInfoResolver = new DefaultJsonTypeInfoResolver
            {
                Modifiers =
                {
                    static typeInfo =>
                    {
                        foreach (var propertyInfo in typeInfo.Properties)
                        {
                            // Strip IsRequired constraint from every property.
                            propertyInfo.IsRequired = false;
                        }
                    },
                },
            },
        };
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

    public static T DeserializeWithFallback<T>(string json)
    {
        return JsonSerializer.Deserialize<T>(json, JsonOptions.JsonSerializerOptionsWithFallback)!;
    }
}
