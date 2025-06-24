using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<SpecialEnum>))]
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

    [EnumMember(Value = "Hello\\0World")]
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

    [EnumMember(Value = "\\n\\r\\t\\0\\u0008\\f\\v\\u0007")]
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
