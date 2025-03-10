using System.Globalization;

namespace SeedFileUpload.Core;

public static class ValueToStringConverter
{
    internal static string Convert<T>(T value)
    {
        return value switch
        {
            null => "null",
            string str => str,
            true => "true",
            false => "false",
            int i => Convert(i),
            long l => Convert(l),
            float f => Convert(f),
            double d => Convert(d),
            decimal dec => Convert(dec),
            short s => Convert(s),
            ushort u => Convert(u),
            uint u => Convert(u),
            ulong u => Convert(u),
            char c => Convert(c),
            Guid guid => Convert(guid),
            Enum e => JsonUtils.Serialize(e).Trim('"'),
            _ => JsonUtils.Serialize(value).Trim('"'),
        };
    }

    internal static string Convert(bool v) => v ? "true" : "false";
    internal static string Convert(int v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(long v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(float v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(double v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(decimal v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(short v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(ushort v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(uint v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(ulong v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(char v) => v.ToString(CultureInfo.InvariantCulture);
    internal static string Convert(Guid v) => v.ToString("D");
}