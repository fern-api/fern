using System.Text.Json;
using SeedFileUpload.Core;

internal static class QueryString
{
    internal static IEnumerable<KeyValuePair<string, string>> ToQueryStringCollection(object value)
    {
        var queryCollection = new List<KeyValuePair<string, string>>();
        var json = JsonUtils.SerializeToElement(value);
        FlattenJsonElement(json, "", queryCollection);
        return queryCollection;
    }

    private static void FlattenJsonElement(JsonElement element, string prefix, List<KeyValuePair<string, string>> parameters)
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
                    
                    if (item.ValueKind != JsonValueKind.Object && item.ValueKind != JsonValueKind.Array)
                    {
                        parameters.Add(new KeyValuePair<string, string>(newPrefix, ValueToString(item)));
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
            _ => element.GetRawText()
        };
    }

    internal static string ConvertValue<T>(T value) => value is null ? "" : ValueToStringConverter.Convert(value);
    internal static string ConvertValue(bool v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(int v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(long v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(float v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(double v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(decimal v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(short v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(ushort v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(uint v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(ulong v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(char v) => ValueToStringConverter.Convert(v);
    internal static string ConvertValue(Guid v) => ValueToStringConverter.Convert(v);
}