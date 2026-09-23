<?php

namespace <%= namespace%>;

use <%= coreNamespace%>\Json\JsonSerializableType;

/**
 * Base class for generated types that have an XML wire representation.
 */
abstract class XmlSerializableType extends JsonSerializableType implements XmlNode
{
    /** @var array<string, string> XML attributes that are not part of the typed model. They are written back by toXml(). */
    private array $__additionalAttributes = [];

    /** @var list<XmlNode> Child elements that are not part of the typed model. They are written back by toXml(). */
    private array $__additionalChildren = [];

    /**
     * Renders this value as a generic XML element tree.
     */
    abstract public function toXmlElement(): XmlElement;

    /**
     * Serializes this value to an XML string.
     *
     * @param bool $xmlDeclaration Whether to prepend the `<?xml ...?>` declaration.
     */
    public function toXml(bool $xmlDeclaration = false): string
    {
        return XmlUtils::serialize($this->toXmlElement(), $xmlDeclaration);
    }

    /**
     * @return array<string, string> XML attributes that are not part of the typed model.
     */
    public function getAdditionalAttributes(): array
    {
        return $this->__additionalAttributes;
    }

    /**
     * @param array<string, string|int|float|bool|\BackedEnum|null> $attributes
     */
    public function setAdditionalAttributes(array $attributes): static
    {
        $this->__additionalAttributes = [];
        foreach ($attributes as $name => $value) {
            $this->setAdditionalAttribute($name, $value);
        }
        return $this;
    }

    /**
     * Sets (or, when $value is null, removes) an XML attribute that is not part of the typed model.
     */
    public function setAdditionalAttribute(string $name, string|int|float|bool|\BackedEnum|null $value): static
    {
        $string = XmlUtils::toXmlString($value);
        if ($string === null) {
            unset($this->__additionalAttributes[$name]);
        } else {
            $this->__additionalAttributes[$name] = $string;
        }
        return $this;
    }

    /**
     * @return list<XmlNode> Child elements that are not part of the typed model.
     */
    public function getAdditionalChildren(): array
    {
        return $this->__additionalChildren;
    }

    /**
     * @param list<XmlNode> $children
     */
    public function setAdditionalChildren(array $children): static
    {
        $this->__additionalChildren = array_values($children);
        return $this;
    }

    /**
     * Adds an arbitrary child element (for elements not covered by the typed model).
     */
    public function addChild(XmlNode $child): static
    {
        $this->__additionalChildren[] = $child;
        return $this;
    }
}
