using System.Text.Json.Serialization;

namespace SeedEnum.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
