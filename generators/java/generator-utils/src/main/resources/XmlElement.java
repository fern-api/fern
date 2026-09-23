import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.w3c.dom.Attr;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * An arbitrary xml element that is not described by the API definition. Used to attach custom child elements to a
 * generated type and to preserve unknown child elements when parsing.
 */
public final class XmlElement implements XmlSerializable {

    private final String name;
    private final Map<String, String> attributes;
    private final Optional<String> text;
    private final List<XmlElement> children;

    private XmlElement(Builder builder) {
        this.name = builder.name;
        this.attributes = Collections.unmodifiableMap(new LinkedHashMap<>(builder.attributes));
        this.text = builder.text;
        this.children = Collections.unmodifiableList(new ArrayList<>(builder.children));
    }

    public String getName() {
        return name;
    }

    public Map<String, String> getAttributes() {
        return attributes;
    }

    public Optional<String> getText() {
        return text;
    }

    public List<XmlElement> getChildren() {
        return children;
    }

    @Override
    public String toXml() {
        return toXml(false);
    }

    @Override
    public String toXml(boolean xmlDeclaration) {
        XmlWriter writer = new XmlWriter(name);
        writer.attributes(attributes);
        writer.text(text);
        writer.children(children);
        return writer.toXml(xmlDeclaration);
    }

    public static XmlElement fromXml(String xml) {
        return fromXml(XmlReader.parse(xml));
    }

    public static XmlElement fromXml(Element element) {
        Builder builder = builder(element.getTagName());
        NamedNodeMap attributes = element.getAttributes();
        for (int i = 0; i < attributes.getLength(); i++) {
            Attr attr = (Attr) attributes.item(i);
            builder.attribute(attr.getName(), attr.getValue());
        }
        XmlReader.text(element).ifPresent(builder::text);
        NodeList nodes = element.getChildNodes();
        for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                builder.child(fromXml((Element) node));
            }
        }
        return builder.build();
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof XmlElement)) {
            return false;
        }
        XmlElement that = (XmlElement) other;
        return name.equals(that.name)
                && attributes.equals(that.attributes)
                && text.equals(that.text)
                && children.equals(that.children);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, attributes, text, children);
    }

    @Override
    public String toString() {
        return toXml(false);
    }

    public static Builder builder(String name) {
        return new Builder(name);
    }

    public static final class Builder {
        private final String name;
        private final Map<String, String> attributes = new LinkedHashMap<>();
        private Optional<String> text = Optional.empty();
        private final List<XmlElement> children = new ArrayList<>();

        private Builder(String name) {
            this.name = Objects.requireNonNull(name, "name must not be null");
        }

        public Builder attribute(String attributeName, String value) {
            this.attributes.put(attributeName, value);
            return this;
        }

        public Builder attributes(Map<String, String> values) {
            this.attributes.putAll(values);
            return this;
        }

        public Builder text(String value) {
            this.text = Optional.ofNullable(value);
            return this;
        }

        public Builder child(XmlElement child) {
            this.children.add(child);
            return this;
        }

        public Builder children(List<XmlElement> values) {
            this.children.addAll(values);
            return this;
        }

        public XmlElement build() {
            return new XmlElement(this);
        }
    }
}
