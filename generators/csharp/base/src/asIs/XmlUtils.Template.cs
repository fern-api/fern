using global::System.Globalization;
using global::System.IO;
using global::System.Text.Json;
using global::System.Xml;
using global::System.Xml.Linq;

namespace <%= namespace%>;

/// <summary>
/// Helpers shared by the generated XML-encoded models.
/// </summary>
internal static class XmlUtils
{
    private const string XmlDeclaration = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";

    private static readonly XmlReaderSettings ReaderSettings = new()
    {
        DtdProcessing = DtdProcessing.Prohibit,
        XmlResolver = null,
        IgnoreComments = true,
        IgnoreProcessingInstructions = true,
    };

    internal static XElement CreateElement(string name, string? @namespace, string? prefix)
    {
        if (string.IsNullOrEmpty(@namespace))
        {
            return new XElement(name);
        }
        var ns = XNamespace.Get(@namespace);
        var element = new XElement(ns + name);
        if (!string.IsNullOrEmpty(prefix))
        {
            element.Add(new XAttribute(XNamespace.Xmlns + prefix, @namespace));
        }
        return element;
    }

    internal static string Serialize(XElement element, bool xmlDeclaration = false)
    {
        var xml = element.ToString(SaveOptions.DisableFormatting);
        return xmlDeclaration ? XmlDeclaration + xml : xml;
    }

    /// <summary>
    /// Parses an XML document securely (no DTDs, no external resolution) and returns its root element.
    /// </summary>
    internal static XElement ParseDocument(string xml)
    {
        if (xml == null)
        {
            throw new ArgumentNullException(nameof(xml));
        }
        try
        {
            using var reader = XmlReader.Create(new StringReader(xml), ReaderSettings);
            var document = XDocument.Load(reader, LoadOptions.None);
            return document.Root ?? throw new ArgumentException("XML document has no root element");
        }
        catch (XmlException e)
        {
            throw new ArgumentException($"Invalid XML: {e.Message}", e);
        }
    }

    internal static XElement ParseRoot(string xml, string expectedName)
    {
        var root = ParseDocument(xml);
        RequireName(root, expectedName);
        return root;
    }

    internal static void RequireName(XElement element, string expectedName)
    {
        if (element.Name.LocalName != expectedName)
        {
            throw new ArgumentException(
                $"Expected XML element <{expectedName}> but found <{element.Name.LocalName}>"
            );
        }
    }

    internal static string? GetPrefix(XElement element)
    {
        var ns = element.Name.NamespaceName;
        if (ns == "")
        {
            return null;
        }
        var prefix = element.GetPrefixOfNamespace(element.Name.Namespace);
        return string.IsNullOrEmpty(prefix) ? null : prefix;
    }

    internal static string GetAttributeName(XAttribute attribute)
    {
        var ns = attribute.Name.Namespace;
        if (ns == XNamespace.None)
        {
            return attribute.Name.LocalName;
        }
        if (ns == XNamespace.Xml)
        {
            return "xml:" + attribute.Name.LocalName;
        }
        var prefix = attribute.Parent?.GetPrefixOfNamespace(ns);
        return string.IsNullOrEmpty(prefix)
            ? attribute.Name.LocalName
            : prefix + ":" + attribute.Name.LocalName;
    }

    private static XName ResolveAttributeName(XElement element, string name)
    {
        var colon = name.IndexOf(':');
        if (colon < 0)
        {
            return name;
        }
        var prefix = name.Substring(0, colon);
        var local = name.Substring(colon + 1);
        if (prefix == "xml")
        {
            return XNamespace.Xml + local;
        }
        var ns = element.GetNamespaceOfPrefix(prefix);
        if (ns == null)
        {
            throw new ArgumentException($"Unknown namespace prefix '{prefix}' in attribute '{name}'");
        }
        return ns + local;
    }

    internal static string? GetAttribute(XElement element, string name)
    {
        var colon = name.IndexOf(':');
        if (colon < 0)
        {
            return element.Attribute(name)?.Value;
        }
        var prefix = name.Substring(0, colon);
        var local = name.Substring(colon + 1);
        var ns = prefix == "xml" ? XNamespace.Xml : element.GetNamespaceOfPrefix(prefix);
        return ns == null ? null : element.Attribute(ns + local)?.Value;
    }

    internal static string RequireAttribute(XElement element, string name)
    {
        return GetAttribute(element, name)
            ?? throw new ArgumentException(
                $"Missing required attribute '{name}' on <{element.Name.LocalName}>"
            );
    }

    internal static void SetAttribute(XElement element, string name, string? value)
    {
        if (value == null)
        {
            return;
        }
        element.SetAttributeValue(ResolveAttributeName(element, name), value);
    }

    internal static string? GetText(XElement element)
    {
        string? text = null;
        foreach (var node in element.Nodes())
        {
            if (node is XText textNode)
            {
                text = (text ?? "") + textNode.Value;
            }
        }
        return text;
    }

    internal static string RequireText(XElement element)
    {
        return GetText(element)
            ?? throw new ArgumentException($"Missing required text content on <{element.Name.LocalName}>");
    }

    /// <summary>
    /// Replaces the text content of <paramref name="element"/>. Null leaves the element unchanged.
    /// </summary>
    internal static void SetText(XElement element, string? value)
    {
        if (value == null)
        {
            return;
        }
        foreach (var node in element.Nodes().OfType<XText>().ToList())
        {
            node.Remove();
        }
        element.Add(new XText(value));
    }

    /// <summary>
    /// Appends a child element carrying a scalar value as text. Null values are skipped.
    /// </summary>
    internal static void AddChildValue(XElement element, string name, string? value)
    {
        if (value != null)
        {
            element.Add(new XElement(name, value));
        }
    }

    /// <summary>
    /// Returns the text of the first child named <paramref name="name"/>, or null when the child
    /// is absent. A present but empty child (<c>&lt;Foo/&gt;</c>) yields <c>""</c> so that an
    /// explicitly written empty value is distinguishable from a missing one.
    /// </summary>
    internal static string? GetChildText(XElement element, string name)
    {
        foreach (var child in element.Elements())
        {
            if (child.Name.LocalName == name)
            {
                return GetText(child) ?? "";
            }
        }
        return null;
    }

    internal static string RequireChildText(XElement element, string name)
    {
        return GetChildText(element, name) ?? throw MissingChild(element, name);
    }

    internal static ArgumentException MissingChild(XElement element, params string[] names)
    {
        return new ArgumentException(
            $"Missing required child element <{string.Join("|", names)}> on <{element.Name.LocalName}>"
        );
    }

    /// <summary>
    /// Parses every child named <paramref name="name"/> under <paramref name="parent"/> as a scalar.
    /// Returns null when the parent (a wrapper) is absent.
    /// </summary>
    internal static List<T>? ParseChildList<T>(XElement? parent, string name)
    {
        if (parent == null)
        {
            return null;
        }
        var result = new List<T>();
        foreach (var child in parent.Elements())
        {
            if (child.Name.LocalName == name)
            {
                result.Add(ParseValue<T>(GetText(child) ?? ""));
            }
        }
        return result;
    }

    internal static HashSet<T>? ParseChildSet<T>(XElement? parent, string name)
    {
        var list = ParseChildList<T>(parent, name);
        return list == null ? null : new HashSet<T>(list);
    }

    /// <summary>
    /// Parses every child of <paramref name="parent"/> whose name is in <paramref name="names"/>.
    /// Returns null when the parent (a wrapper) is absent.
    /// </summary>
    internal static List<T>? ParseChildren<T>(XElement? parent, string[] names, Func<XElement, T> parse)
    {
        if (parent == null)
        {
            return null;
        }
        var result = new List<T>();
        foreach (var child in GetChildren(parent, names))
        {
            result.Add(parse(child));
        }
        return result;
    }

    internal static HashSet<T>? ParseChildrenSet<T>(XElement? parent, string[] names, Func<XElement, T> parse)
    {
        var list = ParseChildren(parent, names, parse);
        return list == null ? null : new HashSet<T>(list);
    }

    internal static IEnumerable<XElement> GetChildren(XElement element, params string[] names)
    {
        foreach (var child in element.Elements())
        {
            if (Array.IndexOf(names, child.Name.LocalName) >= 0)
            {
                yield return child;
            }
        }
    }

    internal static XElement? GetWrapper(XElement element, string wrapperName)
    {
        foreach (var child in element.Elements())
        {
            if (child.Name.LocalName == wrapperName)
            {
                return child;
            }
        }
        return null;
    }

    internal static XElement AddWrapper(XElement element, string wrapperName)
    {
        var wrapper = new XElement(wrapperName);
        element.Add(wrapper);
        return wrapper;
    }

    internal static XElement ToXElement(object? value)
    {
        if (value is IXmlNode node)
        {
            return node.ToXElement();
        }
        throw new ArgumentException(
            $"Value of type {value?.GetType().Name ?? "null"} cannot be serialized to XML"
        );
    }

    internal static ArgumentException UnexpectedElement(XElement element)
    {
        return new ArgumentException($"Unexpected XML element <{element.Name.LocalName}>");
    }

    /// <summary>
    /// Formats a scalar value the way it appears in an XML attribute or text node.
    /// </summary>
    internal static string? ToXmlString(object? value)
    {
        switch (value)
        {
            case null:
                return null;
            case string s:
                return s;
            case bool b:
                return b ? "true" : "false";
            case DateTime dateTime:
                return dateTime.ToString(Constants.DateTimeFormat, CultureInfo.InvariantCulture);
            case int or long or short or byte or uint or ulong or ushort or sbyte or double or float or decimal:
                return Convert.ToString(value, CultureInfo.InvariantCulture);
            default:
            {
                var json = JsonUtils.Serialize(value);
                return json.Length >= 2 && json[0] == '"' && json[json.Length - 1] == '"'
                    ? JsonSerializer.Deserialize<string>(json)
                    : json;
            }
        }
    }

    internal static string? JoinValues<T>(IEnumerable<T>? values, string separator)
    {
        if (values == null)
        {
            return null;
        }
        var parts = new List<string>();
        foreach (var value in values)
        {
            var text = ToXmlString(value);
            if (text != null)
            {
                parts.Add(text);
            }
        }
        return string.Join(separator, parts);
    }

    /// <summary>
    /// Parses a scalar value from an XML attribute or text node. Returns <c>default</c> when
    /// <paramref name="raw"/> is null.
    /// </summary>
    internal static T ParseValue<T>(string? raw)
    {
        if (raw == null)
        {
            return default!;
        }
        var type = Nullable.GetUnderlyingType(typeof(T)) ?? typeof(T);
        if (type == typeof(string))
        {
            return (T)(object)raw;
        }
        try
        {
            if (type == typeof(bool))
            {
                var trimmed = raw.Trim();
                if (trimmed == "1")
                {
                    return (T)(object)true;
                }
                if (trimmed == "0")
                {
                    return (T)(object)false;
                }
                return (T)(object)bool.Parse(trimmed.ToLowerInvariant());
            }
            if (type.IsPrimitive || type == typeof(decimal))
            {
                return (T)Convert.ChangeType(raw.Trim(), type, CultureInfo.InvariantCulture);
            }
            return JsonUtils.Deserialize<T>(JsonSerializer.Serialize(raw));
        }
        catch (Exception e) when (e is FormatException or OverflowException or JsonException or InvalidCastException)
        {
            throw new ArgumentException($"Cannot parse '{raw}' as {type.Name}: {e.Message}", e);
        }
    }

    internal static List<T>? ParseList<T>(string? raw, string separator)
    {
        if (raw == null)
        {
            return null;
        }
        var result = new List<T>();
        if (raw.Length == 0)
        {
            return result;
        }
        foreach (var part in raw.Split(new[] { separator }, StringSplitOptions.None))
        {
            result.Add(ParseValue<T>(part));
        }
        return result;
    }

    internal static HashSet<T>? ParseSet<T>(string? raw, string separator)
    {
        var list = ParseList<T>(raw, separator);
        return list == null ? null : new HashSet<T>(list);
    }

    internal static Dictionary<string, string> GetAdditionalAttributes(
        XElement element,
        params string[] knownNames
    )
    {
        var result = new Dictionary<string, string>();
        foreach (var attribute in element.Attributes())
        {
            if (attribute.IsNamespaceDeclaration)
            {
                continue;
            }
            var name = GetAttributeName(attribute);
            if (Array.IndexOf(knownNames, name) < 0)
            {
                result[name] = attribute.Value;
            }
        }
        return result;
    }

    /// <summary>
    /// Collects child elements that are not part of the typed model. For wrapper elements listed in
    /// <paramref name="wrappers"/> (wrapper name → known item names), only unknown items and
    /// attributes inside the wrapper are retained. Every item with a known name is treated as
    /// consumed by the typed property, so duplicates collapsed by a set-typed property are not
    /// carried over as additional children.
    /// </summary>
    internal static List<XmlElement> GetAdditionalChildren(
        XElement element,
        string[] knownNames,
        Dictionary<string, string[]>? wrappers = null
    )
    {
        var result = new List<XmlElement>();
        foreach (var child in element.Elements())
        {
            var name = child.Name.LocalName;
            if (wrappers != null && wrappers.TryGetValue(name, out var knownItems))
            {
                var wrapper = XmlElement.FromXElement(child);
                wrapper.Children.RemoveAll(item =>
                    item is XmlElement e && Array.IndexOf(knownItems, e.Name) >= 0
                );
                if (wrapper.Children.Count > 0 || wrapper.Attributes.Count > 0)
                {
                    wrapper.Text = null;
                    result.Add(wrapper);
                }
                continue;
            }
            if (Array.IndexOf(knownNames, name) < 0)
            {
                result.Add(XmlElement.FromXElement(child));
            }
        }
        return result;
    }

    /// <summary>
    /// Writes additional attributes and children. Additional children whose name matches an
    /// already-emitted wrapper element are merged into that wrapper.
    /// </summary>
    internal static void AddAdditional(
        XElement element,
        IDictionary<string, string>? attributes,
        IEnumerable<XmlElement>? children,
        params string[] wrapperNames
    )
    {
        if (attributes != null)
        {
            foreach (var attribute in attributes)
            {
                SetAttribute(element, attribute.Key, attribute.Value);
            }
        }
        if (children == null)
        {
            return;
        }
        foreach (var child in children)
        {
            var wrapper = Array.IndexOf(wrapperNames, child.Name) >= 0 ? GetWrapper(element, child.Name) : null;
            if (wrapper == null)
            {
                element.Add(child.ToXElement());
                continue;
            }
            foreach (var attribute in child.Attributes)
            {
                SetAttribute(wrapper, attribute.Key, attribute.Value);
            }
            foreach (var item in child.Children)
            {
                wrapper.Add(item.ToXElement());
            }
        }
    }

    internal static List<T> Append<T>(IEnumerable<T>? items, T item)
    {
        var list = items == null ? new List<T>() : new List<T>(items);
        list.Add(item);
        return list;
    }

    internal static HashSet<T> AppendToSet<T>(IEnumerable<T>? items, T item)
    {
        var set = items == null ? new HashSet<T>() : new HashSet<T>(items);
        set.Add(item);
        return set;
    }
}
