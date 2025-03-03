using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using global::System.Text.Json.Serialization.Metadata;

namespace SeedPlainText.Core;

internal static partial class JsonOptions
{
    public static readonly JsonSerializerOptions JsonSerializerOptions;

    static JsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            Converters = { new DateTimeSerializer(),
#if USE_PORTABLE_DATE_ONLY
                new DateOnlyConverter(),
#endif
                new OneOfSerializer() },
#if DEBUG
            WriteIndented = true,
#endif
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver
            {
                Modifiers =
                {
                    static typeInfo =>
                    {
                        if (typeInfo.Kind != JsonTypeInfoKind.Object)
                            return;

                        foreach (var propertyInfo in typeInfo.Properties)
                        {
                            var jsonAccessAttribute = propertyInfo
                                .AttributeProvider?.GetCustomAttributes(
                                    typeof(JsonAccessAttribute),
                                    true
                                )
                                .OfType<JsonAccessAttribute>()
                                .FirstOrDefault();

                            if (jsonAccessAttribute != null)
                            {
                                propertyInfo.IsRequired = false;
                                switch (jsonAccessAttribute.AccessType)
                                {
                                    case JsonAccessType.ReadOnly:
                                        propertyInfo.Get = null;
                                        propertyInfo.ShouldSerialize = (_, _) => false;
                                        break;
                                    case JsonAccessType.WriteOnly:
                                        propertyInfo.Set = null;
                                        break;
                                    default:
                                        throw new ArgumentOutOfRangeException();
                                }
                            }
                        }
                    },
                },
            },
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
