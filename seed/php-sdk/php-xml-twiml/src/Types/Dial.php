<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

class Dial extends XmlSerializableType
{
    /**
     * @var ?string $number
     */
    #[JsonProperty('number')]
    public ?string $number;

    /**
     * @var ?array<string> $statusCallbackEvent
     */
    #[JsonProperty('status_callback_event'), ArrayType(['string'])]
    public ?array $statusCallbackEvent;

    /**
     * @var ?array<value-of<DialRecordItem>> $record
     */
    #[JsonProperty('record'), ArrayType(['string'])]
    public ?array $record;

    /**
     * @var ?array<Number> $numbers
     */
    #[JsonProperty('numbers'), ArrayType([Number::class])]
    public ?array $numbers;

    /**
     * @param array{
     *   number?: ?string,
     *   statusCallbackEvent?: ?array<string>,
     *   record?: ?array<value-of<DialRecordItem>>,
     *   numbers?: ?array<Number>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->number = $values['number'] ?? null;
        $this->statusCallbackEvent = $values['statusCallbackEvent'] ?? null;
        $this->record = $values['record'] ?? null;
        $this->numbers = $values['numbers'] ?? null;
    }

    /**
     * Renders this Dial as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Dial', namespace: 'https://www.twilio.com/twiml', prefix: 'tw');
        $element->text = XmlUtils::toXmlString($this->number);
        $element->setAttribute('statusCallbackEvent', XmlUtils::joinValues($this->statusCallbackEvent, ' '));
        $element->setAttribute('record', XmlUtils::joinValues($this->record, ' '));
        if ($this->numbers !== null) {
            $numbersWrapper = XmlUtils::addWrapper($element, 'Numbers');
            foreach ($this->numbers as $item) {
                $numbersWrapper->addChild($item);
            }
        }
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren(), ['Numbers']);
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Dial>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Dial', 'https://www.twilio.com/twiml'));
    }

    /**
     * Reads a Dial from an already-parsed <Dial> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Dial', 'https://www.twilio.com/twiml');
        $result = new self([
            'number' => XmlUtils::getText($element),
            'statusCallbackEvent' => XmlUtils::parseList($element->getAttribute('statusCallbackEvent'), ' ', XmlUtils::parseString(...)),
            'record' => XmlUtils::enumValues(XmlUtils::parseList($element->getAttribute('record'), ' ', XmlUtils::parseString(...)), DialRecordItem::class),
            'numbers' => XmlUtils::parseChildren($element->getChild('Numbers'), ['Number' => Number::fromXmlElement(...)]),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['statusCallbackEvent', 'record']));
        $result->setAdditionalChildren(XmlUtils::additionalChildren($element, [], ['Numbers' => ['Number']]));
        return $result;
    }

    /**
     * Adds a <Number> child element and returns it (for nesting further children).
     *
     * @param (
     *    Number
     *   |string
     *   |null
     * ) $phoneNumber The <Number> to add, or its text content.
     * @param array{
     *   sendDigits?: ?string,
     * } $attributes Properties of the new <Number> (ignored when a Number is given).
     * @return Number
     */
    public function addNumber(Number|string|null $phoneNumber = null, array $attributes = []): Number
    {
        $phoneNumberElement = $phoneNumber instanceof Number ? $phoneNumber : new Number([...$attributes, 'phoneNumber' => $phoneNumber]);
        $this->numbers = [...($this->numbers ?? []), $phoneNumberElement];
        return $phoneNumberElement;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toXml();
    }
}
