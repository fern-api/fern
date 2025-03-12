using System.Text.Json;

namespace SeedFileUpload.Core;

/// <summary>
/// Converts an object into a query string collection.
/// </summary>
internal static class QueryStringConverter
{
    /// <summary>
    /// Converts an object into a query string collection.
    /// </summary>
    /// <param name="value">Object to form URL-encode. You can pass in an object or dictionary, but not lists, strings, or primitives.</param>
    /// <exception cref="Exception">Throws when passing in a list, a string, or a primitive value.</exception>
    /// <returns>A collection of key value pairs. The keys and values are not URL encoded.</returns>
    internal static IEnumerable<KeyValuePair<string, string>> ToQueryStringCollection(object value)
    {
        var queryCollection = new List<KeyValuePair<string, string>>();
        var json = JsonUtils.SerializeToElement(value);
        AssertRootJson(json);
        FlattenJsonElement(json, "", queryCollection);
        return queryCollection;
    }

    private static void AssertRootJson(JsonElement json)
    {
        switch (json.ValueKind)
        {
            case JsonValueKind.Object:
                break;
            case JsonValueKind.Array:
            case JsonValueKind.Undefined:
            case JsonValueKind.String:
            case JsonValueKind.Number:
            case JsonValueKind.True:
            case JsonValueKind.False:
            case JsonValueKind.Null:
            default:
                throw new Exception(
                    $"Only objects can be converted to query string collections. Given type is {json.ValueKind}."
                );
        }
    }

    private static void FlattenJsonElement(
        JsonElement element,
        string prefix,
        List<KeyValuePair<string, string>> parameters
    )
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                foreach (var property in element.EnumerateObject())
                {
                    var newPrefix = string.IsNullOrEmpty(prefix)
                        ? property.Name
                        : $"{prefix}[{property.Name}]";

                    FlattenJsonElement(property.Value, newPrefix, parameters);
                }
                break;
            case JsonValueKind.Array:
                foreach (var item in element.EnumerateArray())
                {
                    var newPrefix = $"{prefix}[]";

                    if (
                        item.ValueKind != JsonValueKind.Object
                        && item.ValueKind != JsonValueKind.Array
                    )
                    {
                        parameters.Add(
                            new KeyValuePair<string, string>(newPrefix, ValueToString(item))
                        );
                    }
                    else
                    {
                        FlattenJsonElement(item, newPrefix, parameters);
                    }
                }
                break;
            case JsonValueKind.Null:
                break;
            case JsonValueKind.Undefined:
            case JsonValueKind.String:
            case JsonValueKind.Number:
            case JsonValueKind.True:
            case JsonValueKind.False:
            default:
                parameters.Add(new KeyValuePair<string, string>(prefix, ValueToString(element)));
                break;
        }
    }

    private static string ValueToString(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString() ?? "",
            JsonValueKind.Number => element.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Null => "",
            _ => element.GetRawText(),
        };
    }
}
