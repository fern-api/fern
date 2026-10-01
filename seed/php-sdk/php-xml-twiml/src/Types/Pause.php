<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

/**
 * XML element without an explicit xml.name; falls back to the schema name.
 */
class Pause extends XmlSerializableType
{
    /**
     * @var ?int $length
     */
    #[JsonProperty('length')]
    public ?int $length;

    /**
     * @param array{
     *   length?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->length = $values['length'] ?? null;
    }

    /**
     * Renders this Pause as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Pause');
        $element->setAttribute('length', $this->length);
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Pause>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Pause'));
    }

    /**
     * Reads a Pause from an already-parsed <Pause> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Pause');
        $result = new self([
            'length' => XmlUtils::mapOptional($element->getAttribute('length'), XmlUtils::parseInt(...)),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['length']));
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
