<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

class Say extends XmlSerializableType
{
    /**
     * @var ?string $message
     */
    #[JsonProperty('message')]
    public ?string $message;

    /**
     * @var ?string $voice
     */
    #[JsonProperty('voice')]
    public ?string $voice;

    /**
     * @var ?int $loop
     */
    #[JsonProperty('loop')]
    public ?int $loop;

    /**
     * @var ?array<Break_> $children
     */
    #[JsonProperty('children'), ArrayType([Break_::class])]
    public ?array $children;

    /**
     * @param array{
     *   message?: ?string,
     *   voice?: ?string,
     *   loop?: ?int,
     *   children?: ?array<Break_>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->message = $values['message'] ?? null;
        $this->voice = $values['voice'] ?? null;
        $this->loop = $values['loop'] ?? null;
        $this->children = $values['children'] ?? null;
    }

    /**
     * Renders this Say as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Say');
        $element->text = XmlUtils::toXmlString($this->message);
        $element->setAttribute('voice', $this->voice);
        $element->setAttribute('loop', $this->loop);
        foreach ($this->children ?? [] as $item) {
            $element->addChild($item);
        }
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Say>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Say'));
    }

    /**
     * Reads a Say from an already-parsed <Say> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Say');
        $result = new self([
            'message' => XmlUtils::getText($element),
            'voice' => $element->getAttribute('voice'),
            'loop' => XmlUtils::mapOptional($element->getAttribute('loop'), XmlUtils::parseInt(...)),
            'children' => XmlUtils::parseChildren($element, ['break' => Break_::fromXmlElement(...)]),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['voice', 'loop']));
        $result->setAdditionalChildren(XmlUtils::additionalChildren($element, ['break']));
        return $result;
    }

    /**
     * Adds a <break> child element and returns it (for nesting further children).
     *
     * @param (
     *    Break_
     *   |array{
     *   strength?: ?value-of<BreakStrength>,
     *   time?: ?string,
     * }
     * ) $child The <break> to add, or the properties to construct it with.
     * @return Break_
     */
    public function break(Break_|array $child = []): Break_
    {
        $childElement = $child instanceof Break_ ? $child : new Break_($child);
        $this->children = [...($this->children ?? []), $childElement];
        return $childElement;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toXml();
    }
}
