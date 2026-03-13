using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(SpecialEnumSerializer))]
public enum SpecialEnum
{
    [EnumMember(Value = "")]
    A,

    [EnumMember(Value = "Hello \\\"World\\\"")]
    B,

    [EnumMember(Value = "Hello 'World'")]
    C,

    [EnumMember(Value = "Hello\\\\World")]
    D,

    [EnumMember(Value = "Hello\\nWorld")]
    E,

    [EnumMember(Value = "Hello\\rWorld")]
    F,

    [EnumMember(Value = "Hello\\tWorld")]
    H,

    [EnumMember(Value = "Hello\\fWorld")]
    I,

    [EnumMember(Value = "Hello\\u0008World")]
    J,

    [EnumMember(Value = "Hello\\vWorld")]
    K,

    [EnumMember(Value = "Hello\\x00World")]
    L,

    [EnumMember(Value = "Hello\\u0007World")]
    M,

    [EnumMember(Value = "Hello\\u0001World")]
    N,

    [EnumMember(Value = "Hello\\u0002World")]
    O,

    [EnumMember(Value = "Hello\\u001FWorld")]
    P,

    [EnumMember(Value = "Hello\\u007FWorld")]
    Q,

    [EnumMember(Value = "Hello\\u009FWorld")]
    R,

    [EnumMember(Value = "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null")]
    S,

    [EnumMember(Value = "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007")]
    T,

    [EnumMember(Value = "Hello 世界")]
    U,

    [EnumMember(Value = "café")]
    V,

    [EnumMember(Value = "🚀")]
    W,

    [EnumMember(Value = "\\\\n")]
    X,

    [EnumMember(Value = "\\\\")]
    Y,

    [EnumMember(Value = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}")]
    Z,

    [EnumMember(Value = "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'")]
    Aa,

    [EnumMember(Value = "C:\\\\Users\\\\John\\\\Documents\\\\file.txt")]
    Bb,

    [EnumMember(Value = "/usr/local/bin/app")]
    Cc,

    [EnumMember(Value = "\\\\d{3}-\\\\d{2}-\\\\d{4}")]
    Dd,

    [EnumMember(Value = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}")]
    Ee,

    [EnumMember(Value = "transcript[transcriptType=\"final\"]")]
    Ff,

    [EnumMember(Value = "transcript[transcriptType='final']")]
    Gg,
}

internal class SpecialEnumSerializer
    : global::System.Text.Json.Serialization.JsonConverter<SpecialEnum>
{
    public override SpecialEnum Read(
        ref global::System.Text.Json.Utf8JsonReader reader,
        global::System.Type typeToConvert,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        var stringValue =
            reader.GetString()
            ?? throw new global::System.Exception("The JSON value could not be read as a string.");
        return stringValue switch
        {
            "" => SpecialEnum.A,
            "Hello \\\"World\\\"" => SpecialEnum.B,
            "Hello 'World'" => SpecialEnum.C,
            "Hello\\\\World" => SpecialEnum.D,
            "Hello\\nWorld" => SpecialEnum.E,
            "Hello\\rWorld" => SpecialEnum.F,
            "Hello\\tWorld" => SpecialEnum.H,
            "Hello\\fWorld" => SpecialEnum.I,
            "Hello\\u0008World" => SpecialEnum.J,
            "Hello\\vWorld" => SpecialEnum.K,
            "Hello\\x00World" => SpecialEnum.L,
            "Hello\\u0007World" => SpecialEnum.M,
            "Hello\\u0001World" => SpecialEnum.N,
            "Hello\\u0002World" => SpecialEnum.O,
            "Hello\\u001FWorld" => SpecialEnum.P,
            "Hello\\u007FWorld" => SpecialEnum.Q,
            "Hello\\u009FWorld" => SpecialEnum.R,
            "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null" => SpecialEnum.S,
            "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007" => SpecialEnum.T,
            "Hello 世界" => SpecialEnum.U,
            "café" => SpecialEnum.V,
            "🚀" => SpecialEnum.W,
            "\\\\n" => SpecialEnum.X,
            "\\\\" => SpecialEnum.Y,
            "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}" => SpecialEnum.Z,
            "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'" => SpecialEnum.Aa,
            "C:\\\\Users\\\\John\\\\Documents\\\\file.txt" => SpecialEnum.Bb,
            "/usr/local/bin/app" => SpecialEnum.Cc,
            "\\\\d{3}-\\\\d{2}-\\\\d{4}" => SpecialEnum.Dd,
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}" => SpecialEnum.Ee,
            "transcript[transcriptType=\"final\"]" => SpecialEnum.Ff,
            "transcript[transcriptType='final']" => SpecialEnum.Gg,
            _ => default,
        };
    }

    public override void Write(
        global::System.Text.Json.Utf8JsonWriter writer,
        SpecialEnum value,
        global::System.Text.Json.JsonSerializerOptions options
    )
    {
        writer.WriteStringValue(
            value switch
            {
                SpecialEnum.A => "",
                SpecialEnum.B => "Hello \\\"World\\\"",
                SpecialEnum.C => "Hello 'World'",
                SpecialEnum.D => "Hello\\\\World",
                SpecialEnum.E => "Hello\\nWorld",
                SpecialEnum.F => "Hello\\rWorld",
                SpecialEnum.H => "Hello\\tWorld",
                SpecialEnum.I => "Hello\\fWorld",
                SpecialEnum.J => "Hello\\u0008World",
                SpecialEnum.K => "Hello\\vWorld",
                SpecialEnum.L => "Hello\\x00World",
                SpecialEnum.M => "Hello\\u0007World",
                SpecialEnum.N => "Hello\\u0001World",
                SpecialEnum.O => "Hello\\u0002World",
                SpecialEnum.P => "Hello\\u001FWorld",
                SpecialEnum.Q => "Hello\\u007FWorld",
                SpecialEnum.R => "Hello\\u009FWorld",
                SpecialEnum.S => "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null",
                SpecialEnum.T => "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007",
                SpecialEnum.U => "Hello 世界",
                SpecialEnum.V => "café",
                SpecialEnum.W => "🚀",
                SpecialEnum.X => "\\\\n",
                SpecialEnum.Y => "\\\\",
                SpecialEnum.Z => "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}",
                SpecialEnum.Aa => "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'",
                SpecialEnum.Bb => "C:\\\\Users\\\\John\\\\Documents\\\\file.txt",
                SpecialEnum.Cc => "/usr/local/bin/app",
                SpecialEnum.Dd => "\\\\d{3}-\\\\d{2}-\\\\d{4}",
                SpecialEnum.Ee => "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}",
                SpecialEnum.Ff => "transcript[transcriptType=\"final\"]",
                SpecialEnum.Gg => "transcript[transcriptType='final']",
                _ => throw new global::System.ArgumentOutOfRangeException(
                    nameof(value),
                    value,
                    null
                ),
            }
        );
    }
}
