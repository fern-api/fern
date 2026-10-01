<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

class Number extends XmlSerializableType
{
    /**
     * @var ?string $phoneNumber
     */
    #[JsonProperty('phone_number')]
    public ?string $phoneNumber;

    /**
     * @var ?string $sendDigits
     */
    #[JsonProperty('send_digits')]
    public ?string $sendDigits;

    /**
     * @param array{
     *   phoneNumber?: ?string,
     *   sendDigits?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->phoneNumber = $values['phoneNumber'] ?? null;
        $this->sendDigits = $values['sendDigits'] ?? null;
    }

    /**
     * Renders this Number as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Number');
        $element->text = XmlUtils::toXmlString($this->phoneNumber);
        $element->setAttribute('sendDigits', $this->sendDigits);
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Number>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Number'));
    }

    /**
     * Reads a Number from an already-parsed <Number> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Number');
        $result = new self([
            'phoneNumber' => XmlUtils::getText($element),
            'sendDigits' => $element->getAttribute('sendDigits'),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['sendDigits']));
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
