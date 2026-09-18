<?php

namespace <%= namespace%>;

/**
 * A generic XML element. Used as the intermediate representation when parsing and
 * serializing generated XML types, and to preserve child elements that are not part
 * of the typed model (they are written back as-is).
 */
final class XmlElement implements XmlNode
{
    /**
     * @var array<string, string> Attributes keyed by their (possibly prefixed) name.
     */
    public array $attributes;

    /**
     * @var list<XmlNode> Child elements in document order.
     */
    public array $children;

    /**
     * @var array<string, string> Namespace declarations on this element, keyed by prefix ('' for the default namespace).
     */
    public array $namespaceDeclarations = [];

    /**
     * @param string $name Local element name.
     * @param ?string $text Text content, if any.
     * @param array<string, string|int|float|bool|\BackedEnum|null> $attributes
     * @param list<XmlNode> $children
     * @param ?string $namespace Namespace URI, if any.
     * @param ?string $prefix Namespace prefix, if any.
     */
    public function __construct(
        public string $name,
        public ?string $text = null,
        array $attributes = [],
        array $children = [],
        public ?string $namespace = null,
        public ?string $prefix = null,
    ) {
        $this->attributes = [];
        foreach ($attributes as $key => $value) {
            $this->setAttribute($key, $value);
        }
        $this->children = array_values($children);
    }

    /**
     * Sets (or, when $value is null, removes) an attribute.
     *
     * @param string|int|float|bool|\BackedEnum|null $value
     */
    public function setAttribute(string $name, string|int|float|bool|\BackedEnum|null $value): self
    {
        $string = XmlUtils::toXmlString($value);
        if ($string === null) {
            unset($this->attributes[$name]);
        } else {
            $this->attributes[$name] = $string;
        }
        return $this;
    }

    public function getAttribute(string $name): ?string
    {
        return $this->attributes[$name] ?? null;
    }

    public function addChild(XmlNode $child): self
    {
        $this->children[] = $child;
        return $this;
    }

    /**
     * @return list<XmlElement> Direct child elements with the given local name.
     */
    public function getChildren(string $name): array
    {
        $result = [];
        foreach ($this->children as $child) {
            $element = $child instanceof XmlElement ? $child : $child->toXmlElement();
            if ($element->name === $name) {
                $result[] = $element;
            }
        }
        return $result;
    }

    public function getChild(string $name): ?XmlElement
    {
        return $this->getChildren($name)[0] ?? null;
    }

    public function toXmlElement(): XmlElement
    {
        return $this;
    }

    /**
     * Serializes this element to an XML string.
     *
     * @param bool $xmlDeclaration Whether to prepend the `<?xml ...?>` declaration.
     */
    public function toXml(bool $xmlDeclaration = false): string
    {
        return XmlUtils::serialize($this, $xmlDeclaration);
    }

    /**
     * Parses an XML document into a generic element tree.
     *
     * @throws \InvalidArgumentException If the XML is malformed or contains a DOCTYPE.
     */
    public static function fromXml(string $xml): self
    {
        return XmlUtils::parseDocument($xml);
    }

    public function __toString(): string
    {
        return $this->toXml();
    }
}
