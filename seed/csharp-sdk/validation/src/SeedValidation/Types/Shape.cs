using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedValidation;
using SeedValidation.Core;

#nullable enable

namespace SeedValidation;

[JsonConverter(typeof(StringEnumSerializer<Shape>))]
public enum Shape
{
    [EnumMember(Value = "SQUARE")]
    Square,

    [EnumMember(Value = "CIRCLE")]
    Circle,

    [EnumMember(Value = "TRIANGLE")]
    Triangle
}
