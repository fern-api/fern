namespace SeedFileUpload.Core;

public static class PathParameter
{
    internal static string Convert<T>(T value) => ValueToStringConverter.Convert(value);
    internal static string Convert(bool v) => ValueToStringConverter.Convert(v);
    internal static string Convert(int v) => ValueToStringConverter.Convert(v);
    internal static string Convert(long v) => ValueToStringConverter.Convert(v);
    internal static string Convert(float v) => ValueToStringConverter.Convert(v);
    internal static string Convert(double v) => ValueToStringConverter.Convert(v);
    internal static string Convert(decimal v) => ValueToStringConverter.Convert(v);
    internal static string Convert(short v) => ValueToStringConverter.Convert(v);
    internal static string Convert(ushort v) => ValueToStringConverter.Convert(v);
    internal static string Convert(uint v) => ValueToStringConverter.Convert(v);
    internal static string Convert(ulong v) => ValueToStringConverter.Convert(v);
    internal static string Convert(char v) => ValueToStringConverter.Convert(v);
    internal static string Convert(Guid v) => ValueToStringConverter.Convert(v);
}