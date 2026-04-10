using global::System.Text.Json.Serialization;
using global::System.Runtime.Serialization;

namespace SeedApi;

[JsonConverter(typeof(SpecialEnumSerializer))]
public enum SpecialEnum
{
    [EnumMember(Value = "")]Empty,

    [EnumMember(Value = "Hello \\\"World\\\"")]HelloWorld,

    [EnumMember(Value = "Hello\\nWorld")]HelloNWorld,

    [EnumMember(Value = "Hello\\rWorld")]HelloRWorld,

    [EnumMember(Value = "Hello\\tWorld")]HelloTWorld,

    [EnumMember(Value = "Hello\\fWorld")]HelloFWorld,

    [EnumMember(Value = "Hello\\u0008World")]HelloU0008World,

    [EnumMember(Value = "Hello\\vWorld")]HelloVWorld,

    [EnumMember(Value = "Hello\\x00World")]HelloX00World,

    [EnumMember(Value = "Hello\\u0007World")]HelloU0007World,

    [EnumMember(Value = "Hello\\u0001World")]HelloU0001World,

    [EnumMember(Value = "Hello\\u0002World")]HelloU0002World,

    [EnumMember(Value = "Hello\\u001FWorld")]HelloU001FWorld,

    [EnumMember(Value = "Hello\\u007FWorld")]HelloU007FWorld,

    [EnumMember(Value = "Hello\\u009FWorld")]HelloU009FWorld,

    [EnumMember(Value = "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null")]Line1NQuoteTTabBackslashRnLine20Null,

    [EnumMember(Value = "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007")]Nrtx00U0008Fvu0007,

    [EnumMember(Value = "Hello 世界")]Hello世界,

    [EnumMember(Value = "café")]Cafe,

    [EnumMember(Value = "🚀")]🚀,

    [EnumMember(Value = "\\\\n")]N,

    [EnumMember(Value = "\\\\")]_,

    [EnumMember(Value = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}")]NameJohnAge30CityNewYork,

    [EnumMember(Value = "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'")]SelectFromUsersWhereNameJohnOReilly,

    [EnumMember(Value = "C:\\\\Users\\\\John\\\\Documents\\\\file.txt")]CUsersJohnDocumentsFileTxt,

    [EnumMember(Value = "/usr/local/bin/app")]UsrLocalBinApp,

    [EnumMember(Value = "\\\\d{3}-\\\\d{2}-\\\\d{4}")]D3D2D4,

    [EnumMember(Value = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}")]Azaz09Azaz09Azaz2,

    [EnumMember(Value = "transcript[transcriptType=\"final\"]")]TranscriptTranscriptTypeFinal
}

internal class SpecialEnumSerializer : global::System.Text.Json.Serialization.JsonConverter<SpecialEnum>
{
    private static readonly global::System.Collections.Generic.Dictionary<string, SpecialEnum> _stringToEnum = new()
    {
        { "", SpecialEnum.Empty },
        { "Hello \\\"World\\\"", SpecialEnum.HelloWorld },
        { "Hello\\nWorld", SpecialEnum.HelloNWorld },
        { "Hello\\rWorld", SpecialEnum.HelloRWorld },
        { "Hello\\tWorld", SpecialEnum.HelloTWorld },
        { "Hello\\fWorld", SpecialEnum.HelloFWorld },
        { "Hello\\u0008World", SpecialEnum.HelloU0008World },
        { "Hello\\vWorld", SpecialEnum.HelloVWorld },
        { "Hello\\x00World", SpecialEnum.HelloX00World },
        { "Hello\\u0007World", SpecialEnum.HelloU0007World },
        { "Hello\\u0001World", SpecialEnum.HelloU0001World },
        { "Hello\\u0002World", SpecialEnum.HelloU0002World },
        { "Hello\\u001FWorld", SpecialEnum.HelloU001FWorld },
        { "Hello\\u007FWorld", SpecialEnum.HelloU007FWorld },
        { "Hello\\u009FWorld", SpecialEnum.HelloU009FWorld },
        { "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null", SpecialEnum.Line1NQuoteTTabBackslashRnLine20Null },
        { "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007", SpecialEnum.Nrtx00U0008Fvu0007 },
        { "Hello 世界", SpecialEnum.Hello世界 },
        { "café", SpecialEnum.Cafe },
        { "🚀", SpecialEnum.🚀 },
        { "\\\\n", SpecialEnum.N },
        { "\\\\", SpecialEnum._ },
        { "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}", SpecialEnum.NameJohnAge30CityNewYork },
        { "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'", SpecialEnum.SelectFromUsersWhereNameJohnOReilly },
        { "C:\\\\Users\\\\John\\\\Documents\\\\file.txt", SpecialEnum.CUsersJohnDocumentsFileTxt },
        { "/usr/local/bin/app", SpecialEnum.UsrLocalBinApp },
        { "\\\\d{3}-\\\\d{2}-\\\\d{4}", SpecialEnum.D3D2D4 },
        { "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}", SpecialEnum.Azaz09Azaz09Azaz2 },
        { "transcript[transcriptType=\"final\"]", SpecialEnum.TranscriptTranscriptTypeFinal },
    };

    private static readonly global::System.Collections.Generic.Dictionary<SpecialEnum, string> _enumToString = new()
    {
        { SpecialEnum.Empty, "" },
        { SpecialEnum.HelloWorld, "Hello \\\"World\\\"" },
        { SpecialEnum.HelloNWorld, "Hello\\nWorld" },
        { SpecialEnum.HelloRWorld, "Hello\\rWorld" },
        { SpecialEnum.HelloTWorld, "Hello\\tWorld" },
        { SpecialEnum.HelloFWorld, "Hello\\fWorld" },
        { SpecialEnum.HelloU0008World, "Hello\\u0008World" },
        { SpecialEnum.HelloVWorld, "Hello\\vWorld" },
        { SpecialEnum.HelloX00World, "Hello\\x00World" },
        { SpecialEnum.HelloU0007World, "Hello\\u0007World" },
        { SpecialEnum.HelloU0001World, "Hello\\u0001World" },
        { SpecialEnum.HelloU0002World, "Hello\\u0002World" },
        { SpecialEnum.HelloU001FWorld, "Hello\\u001FWorld" },
        { SpecialEnum.HelloU007FWorld, "Hello\\u007FWorld" },
        { SpecialEnum.HelloU009FWorld, "Hello\\u009FWorld" },
        { SpecialEnum.Line1NQuoteTTabBackslashRnLine20Null, "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null" },
        { SpecialEnum.Nrtx00U0008Fvu0007, "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007" },
        { SpecialEnum.Hello世界, "Hello 世界" },
        { SpecialEnum.Cafe, "café" },
        { SpecialEnum.🚀, "🚀" },
        { SpecialEnum.N, "\\\\n" },
        { SpecialEnum._, "\\\\" },
        { SpecialEnum.NameJohnAge30CityNewYork, "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}" },
        { SpecialEnum.SelectFromUsersWhereNameJohnOReilly, "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'" },
        { SpecialEnum.CUsersJohnDocumentsFileTxt, "C:\\\\Users\\\\John\\\\Documents\\\\file.txt" },
        { SpecialEnum.UsrLocalBinApp, "/usr/local/bin/app" },
        { SpecialEnum.D3D2D4, "\\\\d{3}-\\\\d{2}-\\\\d{4}" },
        { SpecialEnum.Azaz09Azaz09Azaz2, "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}" },
        { SpecialEnum.TranscriptTranscriptTypeFinal, "transcript[transcriptType=\"final\"]" },
    };

    public override SpecialEnum Read(ref global::System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, global::System.Text.Json.JsonSerializerOptions options)
    {
        var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");
        return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;
    }

    public override void Write(global::System.Text.Json.Utf8JsonWriter writer, SpecialEnum value, global::System.Text.Json.JsonSerializerOptions options)
    {
        writer.WriteStringValue(_enumToString.TryGetValue(value, out var stringValue) ? stringValue : null);
    }

    public override SpecialEnum ReadAsPropertyName(ref global::System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, global::System.Text.Json.JsonSerializerOptions options)
    {
        var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON property name could not be read as a string.");
        return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;
    }

    public override void WriteAsPropertyName(global::System.Text.Json.Utf8JsonWriter writer, SpecialEnum value, global::System.Text.Json.JsonSerializerOptions options)
    {
        writer.WritePropertyName(_enumToString.TryGetValue(value, out var stringValue) ? stringValue : value.ToString());
    }
}
