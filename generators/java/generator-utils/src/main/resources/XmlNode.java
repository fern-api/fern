import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * One item of an element's ordered content: either a text segment or a child element (a typed model or a generic
 * {@link XmlElement}). Keeping text and children in a single sequence preserves their relative order when
 * serializing and parsing mixed content.
 */
public final class XmlNode {

    private final String text;
    private final XmlSerializable element;

    private XmlNode(String text, XmlSerializable element) {
        this.text = text;
        this.element = element;
    }

    public static XmlNode text(String text) {
        return new XmlNode(Objects.requireNonNull(text, "text"), null);
    }

    public static XmlNode element(XmlSerializable element) {
        return new XmlNode(null, Objects.requireNonNull(element, "element"));
    }

    public boolean isText() {
        return text != null;
    }

    public boolean isElement() {
        return element != null;
    }

    public Optional<String> getText() {
        return Optional.ofNullable(text);
    }

    public Optional<XmlSerializable> getElement() {
        return Optional.ofNullable(element);
    }

    /**
     * Returns the elements in {@code content} that are instances of {@code type}, in order.
     */
    public static <T> List<T> elements(Collection<XmlNode> content, Class<T> type) {
        List<T> matches = new ArrayList<>();
        for (XmlNode node : content) {
            if (node.element != null && type.isInstance(node.element)) {
                matches.add(type.cast(node.element));
            }
        }
        return matches;
    }

    /**
     * Returns the generic {@link XmlElement} children in {@code content}, in order.
     */
    public static List<XmlElement> additionalChildren(Collection<XmlNode> content) {
        return elements(content, XmlElement.class);
    }

    /**
     * Reconciles the ordered content with the typed child properties of a model. Text segments and generic
     * {@link XmlElement}s are kept in place; typed children are kept in place only while they are still referenced by
     * a typed property, and typed children that were set without going through the ordered content (for example by
     * a bulk setter or JSON deserialization) are appended at the end in property order.
     *
     * @param typedChildren typed child property values: {@link XmlSerializable}s, possibly wrapped in
     *     {@link Optional} and/or {@link Collection}
     */
    public static List<XmlNode> ordered(Collection<XmlNode> content, Object... typedChildren) {
        List<XmlSerializable> flattened = new ArrayList<>();
        for (Object value : typedChildren) {
            flatten(value, flattened);
        }
        Map<XmlSerializable, Integer> remaining = new IdentityHashMap<>();
        for (XmlSerializable child : flattened) {
            remaining.merge(child, 1, Integer::sum);
        }
        List<XmlNode> ordered = new ArrayList<>();
        for (XmlNode node : content) {
            if (node.element == null || node.element instanceof XmlElement) {
                ordered.add(node);
            } else if (take(remaining, node.element)) {
                ordered.add(node);
            }
        }
        for (XmlSerializable child : flattened) {
            if (take(remaining, child)) {
                ordered.add(element(child));
            }
        }
        return ordered;
    }

    private static boolean take(Map<XmlSerializable, Integer> remaining, XmlSerializable child) {
        Integer count = remaining.get(child);
        if (count == null || count == 0) {
            return false;
        }
        remaining.put(child, count - 1);
        return true;
    }

    private static void flatten(Object value, List<XmlSerializable> into) {
        if (value instanceof Optional) {
            ((Optional<?>) value).ifPresent(inner -> flatten(inner, into));
        } else if (value instanceof Collection) {
            for (Object item : (Collection<?>) value) {
                flatten(item, into);
            }
        } else if (value instanceof XmlSerializable) {
            into.add((XmlSerializable) value);
        }
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof XmlNode)) {
            return false;
        }
        XmlNode that = (XmlNode) other;
        return Objects.equals(text, that.text) && Objects.equals(element, that.element);
    }

    @Override
    public int hashCode() {
        return Objects.hash(text, element);
    }

    @Override
    public String toString() {
        return text != null ? text : element.toXml(false);
    }
}
