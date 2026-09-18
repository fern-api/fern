<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

/**
 * Root TwiML element.
 */
class Response extends XmlSerializableType
{
    /**
     * @var ?array<(
     *    Say
     *   |Dial
     *   |Pause
     *   |Hangup
     *   |Redirect
     * )> $children
     */
    #[JsonProperty('children'), ArrayType([new Union(Say::class, Dial::class, Pause::class, Hangup::class, Redirect::class)])]
    public ?array $children;

    /**
     * @param array{
     *   children?: ?array<(
     *    Say
     *   |Dial
     *   |Pause
     *   |Hangup
     *   |Redirect
     * )>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->children = $values['children'] ?? null;
    }

    /**
     * Renders this Response as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Response');
        foreach ($this->children ?? [] as $item) {
            $element->addChild($item);
        }
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Response>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Response'));
    }

    /**
     * Reads a Response from an already-parsed <Response> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Response');
        $result = new self([
            'children' => XmlUtils::parseChildren($element, ['Say' => Say::fromXmlElement(...), 'Dial' => Dial::fromXmlElement(...), 'Pause' => Pause::fromXmlElement(...), 'Hangup' => Hangup::fromXmlElement(...), 'Redirect' => Redirect::fromXmlElement(...)]),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, []));
        $result->setAdditionalChildren(XmlUtils::additionalChildren($element, ['Say', 'Dial', 'Pause', 'Hangup', 'Redirect']));
        return $result;
    }

    /**
     * Adds a <Say> child element and returns it (for nesting further children).
     *
     * @param (
     *    Say
     *   |string
     *   |null
     * ) $message The <Say> to add, or its text content.
     * @param array{
     *   voice?: ?string,
     *   loop?: ?int,
     *   children?: ?array<Break_>,
     * } $attributes Properties of the new <Say> (ignored when a Say is given).
     * @return Say
     */
    public function say(Say|string|null $message = null, array $attributes = []): Say
    {
        $messageElement = $message instanceof Say ? $message : new Say([...$attributes, 'message' => $message]);
        $this->children = [...($this->children ?? []), $messageElement];
        return $messageElement;
    }

    /**
     * Adds a <Dial> child element and returns it (for nesting further children).
     *
     * @param (
     *    Dial
     *   |string
     *   |null
     * ) $number The <Dial> to add, or its text content.
     * @param array{
     *   statusCallbackEvent?: ?array<string>,
     *   record?: ?array<value-of<DialRecordItem>>,
     *   numbers?: ?array<Number>,
     * } $attributes Properties of the new <Dial> (ignored when a Dial is given).
     * @return Dial
     */
    public function dial(Dial|string|null $number = null, array $attributes = []): Dial
    {
        $numberElement = $number instanceof Dial ? $number : new Dial([...$attributes, 'number' => $number]);
        $this->children = [...($this->children ?? []), $numberElement];
        return $numberElement;
    }

    /**
     * Adds a <Pause> child element and returns it (for nesting further children).
     *
     * @param (
     *    Pause
     *   |array{
     *   length?: ?int,
     * }
     * ) $child The <Pause> to add, or the properties to construct it with.
     * @return Pause
     */
    public function pause(Pause|array $child = []): Pause
    {
        $childElement = $child instanceof Pause ? $child : new Pause($child);
        $this->children = [...($this->children ?? []), $childElement];
        return $childElement;
    }

    /**
     * Adds a <Hangup> child element and returns it (for nesting further children).
     *
     * @param (
     *    Hangup
     *   |array{
     * }
     * ) $child The <Hangup> to add, or the properties to construct it with.
     * @return Hangup
     */
    public function hangup(Hangup|array $child = []): Hangup
    {
        $childElement = $child instanceof Hangup ? $child : new Hangup($child);
        $this->children = [...($this->children ?? []), $childElement];
        return $childElement;
    }

    /**
     * Adds a <Redirect> child element and returns it (for nesting further children).
     *
     * @param (
     *    Redirect
     *   |string
     * ) $url The <Redirect> to add, or its text content.
     * @param ?array{
     *   method: string,
     *   kind?: ?'redirect',
     * } $attributes Properties of the new <Redirect> (ignored when a Redirect is given).
     * @return Redirect
     */
    public function redirect(Redirect|string $url, ?array $attributes = null): Redirect
    {
        if ($url instanceof Redirect) {
            $urlElement = $url;
        } else {
            if ($attributes === null) {
                throw new \InvalidArgumentException('Attributes are required to construct a new <Redirect>');
            }
            $urlElement = new Redirect([...$attributes, 'url' => $url]);
        }
        $this->children = [...($this->children ?? []), $urlElement];
        return $urlElement;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toXml(xmlDeclaration: true);
    }
}
