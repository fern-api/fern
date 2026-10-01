<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

class Hangup extends XmlSerializableType
{
    /**
     * @param array{
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        unset($values);
    }

    /**
     * Renders this Hangup as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Hangup');
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Hangup>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Hangup'));
    }

    /**
     * Reads a Hangup from an already-parsed <Hangup> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Hangup');
        $result = new self([
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, []));
        $result->setAdditionalChildren(XmlUtils::additionalChildren($element, []));
        return $result;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toXml();
    }
}
