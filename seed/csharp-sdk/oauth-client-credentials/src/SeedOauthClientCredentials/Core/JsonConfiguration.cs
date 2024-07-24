using System.Text.Json;

namespace SeedOauthClientCredentials.Core;

public static class JsonOptions
{
    public static readonly JsonSerializerOptions JsonSerializerOptions;

    static JsonOptions()
    {
        JsonSerializerOptions = new JsonSerializerOptions
        {
            Converters = { new DateTimeSerializer() },
            WriteIndented = true
        };
    }
}

public static class JsonUtils
{
    public static string Serialize<T>(T obj)
    {
        return JsonSerializer.Serialize(obj, JsonOptions.JsonSerializerOptions);
    }

    public static T Deserialize<T>(string json)
    {
        return JsonSerializer.Deserialize<T>(json, JsonOptions.JsonSerializerOptions)!;
    }
}
