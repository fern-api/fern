import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Builds the XML representation of a single element. Values may be wrapped in {@link Optional}, may be
 * {@link Collection}s, and may themselves be {@link XmlSerializable} elements.
 */
public final class XmlWriter {

    public static final String XML_DECLARATION = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

    private final String qualifiedName;
    private final StringBuilder attributes = new StringBuilder();
    private final List<String> content = new ArrayList<>();

    public XmlWriter(String name) {
        this(name, null, null);
    }

    public XmlWriter(String name, String namespace, String prefix) {
        this.qualifiedName = prefix != null && !prefix.isEmpty() ? prefix + ":" + name : name;
        if (namespace != null && !namespace.isEmpty()) {
            String xmlnsAttribute = prefix != null && !prefix.isEmpty() ? "xmlns:" + prefix : "xmlns";
            appendAttribute(xmlnsAttribute, namespace);
        }
    }

    /**
     * Adds an attribute. Absent {@link Optional}s and nulls are skipped; collections are joined with a space.
     */
    public XmlWriter attribute(String name, Object value) {
        return attribute(name, value, " ");
    }

    /**
     * Adds an attribute, joining collection values with the given separator.
     */
    public XmlWriter attribute(String name, Object value, String separator) {
        Object unwrapped = unwrap(value);
        if (unwrapped == null) {
            return this;
        }
        appendAttribute(name, scalarToString(unwrapped, separator));
        return this;
    }

    /**
     * Adds every entry of the map as an attribute.
     */
    public XmlWriter attributes(Map<String, ?> values) {
        if (values == null) {
            return this;
        }
        for (Map.Entry<String, ?> entry : values.entrySet()) {
            attribute(entry.getKey(), entry.getValue());
        }
        return this;
    }

    /**
     * Adds text content. Collections are joined with a space.
     */
    public XmlWriter text(Object value) {
        return text(value, " ");
    }

    /**
     * Adds text content, joining collection values with the given separator.
     */
    public XmlWriter text(Object value, String separator) {
        Object unwrapped = unwrap(value);
        if (unwrapped == null) {
            return this;
        }
        content.add(escape(scalarToString(unwrapped, separator)));
        return this;
    }

    /**
     * Adds child elements. {@link XmlSerializable} values are serialized as-is; scalars are wrapped in an element
     * with the given name. Collections contribute one child per item.
     */
    public XmlWriter children(String name, Object value) {
        Object unwrapped = unwrap(value);
        if (unwrapped == null) {
            return this;
        }
        if (unwrapped instanceof Collection) {
            for (Object item : (Collection<?>) unwrapped) {
                children(name, item);
            }
            return this;
        }
        if (unwrapped instanceof XmlSerializable) {
            content.add(((XmlSerializable) unwrapped).toXml(false));
            return this;
        }
        content.add(new XmlWriter(name).text(unwrapped).toXml(false));
        return this;
    }

    /**
     * Adds child elements that carry their own element name.
     */
    public XmlWriter children(Collection<? extends XmlSerializable> values) {
        if (values == null) {
            return this;
        }
        for (XmlSerializable child : values) {
            content.add(child.toXml(false));
        }
        return this;
    }

    /**
     * Adds child elements wrapped in a container element with the given name. Nothing is emitted when the value is
     * absent.
     */
    public XmlWriter wrappedChildren(String wrapperName, String itemName, Object value) {
        Object unwrapped = unwrap(value);
        if (unwrapped == null) {
            return this;
        }
        content.add(new XmlWriter(wrapperName).children(itemName, unwrapped).toXml(false));
        return this;
    }

    public String toXml(boolean xmlDeclaration) {
        StringBuilder xml = new StringBuilder();
        if (xmlDeclaration) {
            xml.append(XML_DECLARATION);
        }
        xml.append('<').append(qualifiedName).append(attributes);
        if (content.isEmpty()) {
            return xml.append(" />").toString();
        }
        xml.append('>');
        for (String part : content) {
            xml.append(part);
        }
        return xml.append("</").append(qualifiedName).append('>').toString();
    }

    private void appendAttribute(String name, String value) {
        attributes.append(' ').append(name).append("=\"").append(escape(value)).append('"');
    }

    private static Object unwrap(Object value) {
        if (value instanceof Optional) {
            Optional<?> optional = (Optional<?>) value;
            return optional.isPresent() ? unwrap(optional.get()) : null;
        }
        return value;
    }

    private static String scalarToString(Object value, String separator) {
        if (value instanceof Collection) {
            StringBuilder joined = new StringBuilder();
            Iterator<?> iterator = ((Collection<?>) value).iterator();
            while (iterator.hasNext()) {
                Object item = unwrap(iterator.next());
                if (item == null) {
                    continue;
                }
                if (joined.length() > 0) {
                    joined.append(separator);
                }
                joined.append(scalarToString(item, separator));
            }
            return joined.toString();
        }
        return String.valueOf(value);
    }

    public static String escape(String value) {
        StringBuilder escaped = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '&':
                    escaped.append("&amp;");
                    break;
                case '<':
                    escaped.append("&lt;");
                    break;
                case '>':
                    escaped.append("&gt;");
                    break;
                case '"':
                    escaped.append("&quot;");
                    break;
                default:
                    escaped.append(c);
            }
        }
        return escaped.toString();
    }
}
