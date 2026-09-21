<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

class Break_ extends XmlSerializableType
{
    /**
     * @var ?value-of<BreakStrength> $strength
     */
    #[JsonProperty('strength')]
    public ?string $strength;

    /**
     * @var ?string $time
     */
    #[JsonProperty('time')]
    public ?string $time;

    /**
     * @param array{
     *   strength?: ?value-of<BreakStrength>,
     *   time?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->strength = $values['strength'] ?? null;
        $this->time = $values['time'] ?? null;
    }

    /**
     * Renders this Break_ as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('break');
        $element->setAttribute('strength', $this->strength);
        $element->setAttribute('time', $this->time);
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <break>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'break'));
    }

    /**
     * Reads a Break_ from an already-parsed <break> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'break');
        $result = new self([
            'strength' => XmlUtils::parseEnum($element->getAttribute('strength'), BreakStrength::class)?->value,
            'time' => $element->getAttribute('time'),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['strength', 'time']));
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
