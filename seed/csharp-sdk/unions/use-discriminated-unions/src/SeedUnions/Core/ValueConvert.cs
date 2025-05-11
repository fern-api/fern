using global::System.Globalization;

namespace SeedUnions.Core;

/// <summary>
/// Convert values to string for path and query parameters.
/// </summary>
public static class ValueConvert
{
    internal static string ToPathParameterString<T>(T value) => ToString(value);

    internal static string ToPathParameterString(bool v) => ToString(v);

    internal static string ToPathParameterString(int v) => ToString(v);

    internal static string ToPathParameterString(long v) => ToString(v);

    internal static string ToPathParameterString(float v) => ToString(v);

    internal static string ToPathParameterString(double v) => ToString(v);

    internal static string ToPathParameterString(decimal v) => ToString(v);

    internal static string ToPathParameterString(short v) => ToString(v);

    internal static string ToPathParameterString(ushort v) => ToString(v);

    internal static string ToPathParameterString(uint v) => ToString(v);

    internal static string ToPathParameterString(ulong v) => ToString(v);

    internal static string ToPathParameterString(string v) => ToString(v);

    internal static string ToPathParameterString(char v) => ToString(v);

    internal static string ToPathParameterString(Guid v) => ToString(v);

    internal static string ToQueryStringValue<T>(T value) => value is null ? "" : ToString(value);

    internal static string ToQueryStringValue(bool v) => ToString(v);

    internal static string ToQueryStringValue(int v) => ToString(v);

    internal static string ToQueryStringValue(long v) => ToString(v);

    internal static string ToQueryStringValue(float v) => ToString(v);

    internal static string ToQueryStringValue(double v) => ToString(v);

    internal static string ToQueryStringValue(decimal v) => ToString(v);

    internal static string ToQueryStringValue(short v) => ToString(v);

    internal static string ToQueryStringValue(ushort v) => ToString(v);

    internal static string ToQueryStringValue(uint v) => ToString(v);

    internal static string ToQueryStringValue(ulong v) => ToString(v);

    internal static string ToQueryStringValue(string v) => v is null ? "" : v;

    internal static string ToQueryStringValue(char v) => ToString(v);

    internal static string ToQueryStringValue(Guid v) => ToString(v);

    internal static string ToString<T>(T value)
    {
        return value switch
        {
            null => "null",
            string str => str,
            true => "true",
            false => "false",
            int i => ToString(i),
            long l => ToString(l),
            float f => ToString(f),
            double d => ToString(d),
            decimal dec => ToString(dec),
            short s => ToString(s),
            ushort u => ToString(u),
            uint u => ToString(u),
            ulong u => ToString(u),
            char c => ToString(c),
            Guid guid => ToString(guid),
            Enum e => JsonUtils.Serialize(e).Trim('"'),
            _ => JsonUtils.Serialize(value).Trim('"'),
        };
    }

    internal static string ToString(bool v) => v ? "true" : "false";

    internal static string ToString(int v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(long v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(float v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(double v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(decimal v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(short v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(ushort v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(uint v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(ulong v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(char v) => v.ToString(CultureInfo.InvariantCulture);

    internal static string ToString(string v) => v;

    internal static string ToString(Guid v) => v.ToString("D");
}
