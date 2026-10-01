using global::System.Globalization;
using global::System.IO;
using global::System.Runtime.CompilerServices;
using global::System.Text.Json;
using global::System.Xml;
using global::System.Xml.Linq;
using OneOf;

namespace SeedApi.Core;

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
            throw new ArgumentException(
                $"Unknown namespace prefix '{prefix}' in attribute '{name}'"
            );
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
            ?? throw new ArgumentException(
                $"Missing required text content on <{element.Name.LocalName}>"
            );
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
    /// Parses every element in <paramref name="candidates"/> named <paramref name="name"/> as a scalar.
    /// Returns null when <paramref name="candidates"/> is null (an absent wrapper).
    /// </summary>
    internal static List<T>? ParseChildList<T>(IEnumerable<XElement>? candidates, string name)
    {
        if (candidates == null)
        {
            return null;
        }
        var result = new List<T>();
        foreach (var child in candidates)
        {
            if (child.Name.LocalName == name)
            {
                result.Add(ParseValue<T>(GetText(child) ?? ""));
            }
        }
        return result;
    }

    internal static HashSet<T>? ParseChildSet<T>(IEnumerable<XElement>? candidates, string name)
    {
        var list = ParseChildList<T>(candidates, name);
        return list == null ? null : new HashSet<T>(list);
    }

    /// <summary>
    /// Parses every element in <paramref name="candidates"/> whose name is in <paramref name="names"/>.
    /// Returns null when <paramref name="candidates"/> is null (an absent wrapper).
    /// </summary>
    internal static List<T>? ParseChildren<T>(
        IEnumerable<XElement>? candidates,
        string[] names,
        Func<XElement, T> parse
    )
    {
        if (candidates == null)
        {
            return null;
        }
        var result = new List<T>();
        foreach (var child in candidates)
        {
            if (Array.IndexOf(names, child.Name.LocalName) >= 0)
            {
                result.Add(parse(child));
            }
        }
        return result;
    }

    internal static HashSet<T>? ParseChildrenSet<T>(
        IEnumerable<XElement>? candidates,
        string[] names,
        Func<XElement, T> parse
    )
    {
        var list = ParseChildren(candidates, names, parse);
        return list == null ? null : new HashSet<T>(list);
    }

    /// <summary>
    /// The items of every wrapper element named <paramref name="wrapperName"/>, in document order.
    /// Returns null when there is no such wrapper.
    /// </summary>
    internal static IEnumerable<XElement>? GetWrapperItems(XElement element, string wrapperName)
    {
        List<XElement>? items = null;
        foreach (var child in element.Elements())
        {
            if (child.Name.LocalName == wrapperName)
            {
                items ??= new List<XElement>();
                items.AddRange(child.Elements());
            }
        }
        return items;
    }

    /// <summary>
    /// Builds the element for a scalar wrapped-list item. Null values yield null (the item is skipped).
    /// </summary>
    internal static XElement? ChildValue(string name, string? value)
    {
        return value == null ? null : new XElement(name, value);
    }

    /// <summary>
    /// Renders the items of a wrapped list property. Returns null when the list itself is null.
    /// </summary>
    internal static List<XElement>? RenderWrappedItems<T>(
        IEnumerable<T>? items,
        Func<T, XElement?> render
    )
    {
        if (items == null)
        {
            return null;
        }
        var result = new List<XElement>();
        foreach (var item in items)
        {
            var rendered = render(item);
            if (rendered != null)
            {
                result.Add(rendered);
            }
        }
        return result;
    }

    internal static XElement ToXElement(object? value)
    {
        if (value is IOneOf oneOf)
        {
            value = oneOf.Value;
        }
        if (value is IXmlNode node)
        {
            return node.ToXElement();
        }
        throw new ArgumentException(
            $"Value of type {value?.GetType().Name ?? "null"} cannot be serialized to XML"
        );
    }

    /// <summary>
    /// Renders one content item: a text segment or a child element.
    /// </summary>
    internal static XNode ToXNode(object item)
    {
        return item is string text ? new XText(text) : ToXElement(item);
    }

    internal static string? ConcatText(IEnumerable<object> content)
    {
        string? text = null;
        foreach (var item in content)
        {
            if (item is string segment)
            {
                text = (text ?? "") + segment;
            }
        }
        return text;
    }

    /// <summary>
    /// The text before the first child element, or null when there is none. This is the part of
    /// mixed content held by a model's text property; the rest is kept in its content list.
    /// </summary>
    internal static string? GetLeadingText(XElement element)
    {
        string? text = null;
        foreach (var node in element.Nodes())
        {
            if (node is XElement)
            {
                break;
            }
            if (node is XText textNode)
            {
                text = (text ?? "") + textNode.Value;
            }
        }
        return text;
    }

    internal static string RequireLeadingText(XElement element)
    {
        return GetLeadingText(element)
            ?? throw new ArgumentException(
                $"Missing required text content on <{element.Name.LocalName}>"
            );
    }

    /// <summary>
    /// Whitespace-only text that spans a line break comes from pretty-printing and is not content.
    /// </summary>
    private static bool IsContentText(string text)
    {
        if (text.Length == 0)
        {
            return false;
        }
        return text.Trim().Length > 0 || (text.IndexOf('\n') < 0 && text.IndexOf('\r') < 0);
    }

    /// <summary>
    /// Reads an element's content in document order. Text nodes become strings (leading text is
    /// skipped when <paramref name="skipLeadingText"/>, as it belongs to the text property).
    /// Child elements go through <paramref name="parseChild"/> (returning null for elements it does
    /// not know) and otherwise become <see cref="XmlElement"/>s. Elements named in
    /// <paramref name="skipNames"/> (scalar element properties) are left out. Wrapper elements
    /// listed in <paramref name="wrappers"/> (wrapper name → item names) become marker
    /// <see cref="XmlElement"/>s holding their attributes and undeclared content, so the wrapper's
    /// position survives a round trip; the typed items themselves are parsed by the list property.
    /// </summary>
    internal static List<object> ReadContent(
        XElement element,
        Func<XElement, object?>? parseChild,
        bool skipLeadingText,
        string[]? skipNames,
        Dictionary<string, string[]>? wrappers
    )
    {
        var content = new List<object>();
        var beforeFirstElement = true;
        foreach (var node in element.Nodes())
        {
            if (node is XText text)
            {
                if ((skipLeadingText && beforeFirstElement) || !IsContentText(text.Value))
                {
                    continue;
                }
                content.Add(text.Value);
                continue;
            }
            if (node is not XElement child)
            {
                continue;
            }
            beforeFirstElement = false;
            var name = child.Name.LocalName;
            if (wrappers != null && wrappers.TryGetValue(name, out var itemNames))
            {
                var marker = XmlElement.FromXElement(child);
                marker.WrappedItemCount = marker.Content.RemoveAll(item =>
                    item is XmlElement e && Array.IndexOf(itemNames, e.Name) >= 0
                );
                content.Add(marker);
                continue;
            }
            if (skipNames != null && Array.IndexOf(skipNames, name) >= 0)
            {
                continue;
            }
            content.Add(parseChild?.Invoke(child) ?? XmlElement.FromXElement(child));
        }
        return content;
    }

    /// <summary>
    /// Reconciles a model's ordered content with its typed child properties. Text segments and
    /// <see cref="XmlElement"/>s keep their position. Typed children keep their position as long
    /// as a typed property still references them (one position per reference); those no longer
    /// referenced are dropped, and extra references (children assigned to a property directly) are
    /// appended at the end in property order.
    /// </summary>
    internal static List<object> OrderContent(
        IEnumerable<object> content,
        params object?[] typedChildren
    )
    {
        var remaining = new Dictionary<object, int>(ReferenceComparer.Instance);
        var typed = new List<object>();
        foreach (var value in typedChildren)
        {
            CollectTypedChildren(value, typed);
        }
        foreach (var child in typed)
        {
            remaining[child] = remaining.TryGetValue(child, out var count) ? count + 1 : 1;
        }
        var ordered = new List<object>();
        foreach (var item in content)
        {
            if (item is string || item is XmlElement)
            {
                ordered.Add(item);
            }
            else if (TakeTypedChild(remaining, Unwrap(item)))
            {
                ordered.Add(item);
            }
        }
        foreach (var child in typed)
        {
            if (TakeTypedChild(remaining, child))
            {
                ordered.Add(child);
            }
        }
        return ordered;
    }

    private static bool TakeTypedChild(Dictionary<object, int> remaining, object child)
    {
        if (!remaining.TryGetValue(child, out var count) || count == 0)
        {
            return false;
        }
        remaining[child] = count - 1;
        return true;
    }

    private static object Unwrap(object item) => item is IOneOf oneOf ? oneOf.Value : item;

    private static void CollectTypedChildren(object? value, List<object> into)
    {
        switch (value)
        {
            case null:
            case string:
                return;
            case IOneOf oneOf:
                CollectTypedChildren(oneOf.Value, into);
                return;
            case IXmlNode node:
                into.Add(node);
                return;
            case System.Collections.IEnumerable items:
                foreach (var item in items)
                {
                    CollectTypedChildren(item, into);
                }
                return;
            default:
                into.Add(value);
                return;
        }
    }

    private sealed class ReferenceComparer : IEqualityComparer<object>
    {
        internal static readonly ReferenceComparer Instance = new();

        public new bool Equals(object? x, object? y) => ReferenceEquals(x, y);

        public int GetHashCode(object obj) => RuntimeHelpers.GetHashCode(obj);
    }

    /// <summary>
    /// Appends ordered content to <paramref name="element"/>. Marker <see cref="XmlElement"/>s
    /// whose name is a key of <paramref name="wrapped"/> are rendered as that wrapper, each taking
    /// the number of items it held when parsed and the last one taking the rest; wrapped lists with
    /// no marker are appended at the end. A null wrapped list renders no wrapper unless a marker
    /// exists for it.
    /// </summary>
    internal static void AddContent(
        XElement element,
        IEnumerable<object> ordered,
        IDictionary<string, List<XElement>?>? wrapped = null
    )
    {
        var markers = new Dictionary<string, List<XmlElement>>();
        var items = new List<object>(ordered);
        if (wrapped != null)
        {
            foreach (var item in items)
            {
                if (item is XmlElement marker && wrapped.ContainsKey(marker.Name))
                {
                    if (!markers.TryGetValue(marker.Name, out var list))
                    {
                        markers[marker.Name] = list = new List<XmlElement>();
                    }
                    list.Add(marker);
                }
            }
        }
        var positions = new Dictionary<string, int>();
        foreach (var item in items)
        {
            if (
                wrapped != null
                && item is XmlElement marker
                && markers.TryGetValue(marker.Name, out var list)
            )
            {
                var rendered = wrapped[marker.Name] ?? new List<XElement>();
                positions.TryGetValue(marker.Name, out var position);
                var isLast = ReferenceEquals(list[list.Count - 1], marker);
                var take = isLast
                    ? rendered.Count - position
                    : Math.Min(marker.WrappedItemCount, rendered.Count - position);
                element.Add(RenderWrapper(marker.Name, rendered.GetRange(position, take), marker));
                positions[marker.Name] = position + take;
                continue;
            }
            element.Add(ToXNode(item));
        }
        if (wrapped == null)
        {
            return;
        }
        foreach (var entry in wrapped)
        {
            if (entry.Value != null && !markers.ContainsKey(entry.Key))
            {
                element.Add(RenderWrapper(entry.Key, entry.Value, null));
            }
        }
    }

    private static XElement RenderWrapper(string name, List<XElement> items, XmlElement? marker)
    {
        var wrapper = new XElement(name);
        if (marker != null)
        {
            foreach (var attribute in marker.Attributes)
            {
                SetAttribute(wrapper, attribute.Key, attribute.Value);
            }
        }
        foreach (var item in items)
        {
            wrapper.Add(item);
        }
        if (marker != null)
        {
            foreach (var item in marker.Content)
            {
                wrapper.Add(ToXNode(item));
            }
        }
        return wrapper;
    }

    /// <summary>
    /// The typed children of one property, in content order.
    /// </summary>
    internal static List<T> ContentItems<T>(IEnumerable<object> content)
    {
        var result = new List<T>();
        foreach (var item in content)
        {
            if (item is T typed)
            {
                result.Add(typed);
            }
        }
        return result;
    }

    internal static List<T> ContentItems<T>(
        IEnumerable<object> content,
        Func<object, bool> matches,
        Func<object, T> convert
    )
    {
        var result = new List<T>();
        foreach (var item in content)
        {
            if (matches(item))
            {
                result.Add(convert(item));
            }
        }
        return result;
    }

    internal static T? FirstOrNull<T>(List<T> items)
        where T : struct
    {
        return items.Count > 0 ? items[0] : (T?)null;
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
            case int
            or long
            or short
            or byte
            or uint
            or ulong
            or ushort
            or sbyte
            or double
            or float
            or decimal:
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
        catch (Exception e)
            when (e is FormatException or OverflowException or JsonException or InvalidCastException
            )
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

    internal static void SetAttributes(XElement element, IDictionary<string, string>? attributes)
    {
        if (attributes == null)
        {
            return;
        }
        foreach (var attribute in attributes)
        {
            SetAttribute(element, attribute.Key, attribute.Value);
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
