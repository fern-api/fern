using System.Text.Json.Serialization;

namespace SeedValidation.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
