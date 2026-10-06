<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

/**
 * Adding a Pause in <Say>
 */
class Break_ extends XmlSerializableType
{
    /**
     * @var ?value-of<BreakStrength> $strength Set a pause based on strength
     */
    #[JsonProperty('strength')]
    public ?string $strength;

    /**
     * @var ?string $time Set a pause to a specific length of time in seconds or milliseconds, available values: [number]s, [number]ms
     */
    #[JsonProperty('time')]
    public ?string $time;

    /**
     * @param array{
     *   strength?: ?value-of<BreakStrength>,
     *   time?: ?string,
     * } $values
     *   - `strength`: Set a pause based on strength
     *   - `time`: Set a pause to a specific length of time in seconds or milliseconds, available values: [number]s, [number]ms
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
        $typed = [];
        $element->setAttribute('strength', $this->strength);
        $element->setAttribute('time', $this->time);
        XmlUtils::addContent($element, $this->getContent(), $typed, [], $this->getAdditionalChildren(), $this->getAdditionalAttributes());
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
            'strength' => XmlUtils::parseEnumValue($element->getAttribute('strength'), BreakStrength::class),
            'time' => $element->getAttribute('time'),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['strength', 'time']));
        $result->setAdditionalChildren(XmlUtils::additionalChildren($element, []));
        $result->setContent(XmlUtils::content($element, [], $result->getAdditionalChildren()));
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
