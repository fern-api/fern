using System.Text.Json.Serialization;

namespace SeedCsharpXmlEntities.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
