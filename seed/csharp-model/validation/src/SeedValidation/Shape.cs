using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

[JsonConverter(typeof(EnumSerializer<Shape>))]
public enum Shape
{
    [EnumMember(Value = "SQUARE")]
    Square,

    [EnumMember(Value = "CIRCLE")]
    Circle,

    [EnumMember(Value = "TRIANGLE")]
    Triangle,
}
