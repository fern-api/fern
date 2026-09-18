<?php

namespace Seed\Types;

use Seed\Core\Xml\XmlSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Xml\XmlElement;
use Seed\Core\Xml\XmlUtils;
use InvalidArgumentException;

/**
 * Text element with a required attribute.
 */
class Redirect extends XmlSerializableType
{
    /**
     * @var string $url
     */
    #[JsonProperty('url')]
    public string $url;

    /**
     * @var string $method
     */
    #[JsonProperty('method')]
    public string $method;

    /**
     * @var ?'redirect' $kind
     */
    #[JsonProperty('kind')]
    public ?string $kind;

    /**
     * @param array{
     *   url: string,
     *   method: string,
     *   kind?: ?'redirect',
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->url = $values['url'];
        $this->method = $values['method'];
        $this->kind = $values['kind'] ?? null;
    }

    /**
     * Renders this Redirect as a generic XML element tree.
     *
     * @return XmlElement
     */
    public function toXmlElement(): XmlElement
    {
        $element = new XmlElement('Redirect');
        $element->text = XmlUtils::toXmlString($this->url);
        $element->setAttribute('method', $this->method);
        $element->setAttribute('kind', $this->kind);
        XmlUtils::addAdditional($element, $this->getAdditionalAttributes(), $this->getAdditionalChildren());
        return $element;
    }

    /**
     * Parses an XML document whose root element is <Redirect>.
     *
     * @param string $xml
     * @throws InvalidArgumentException
     */
    public static function fromXml(string $xml): self
    {
        return self::fromXmlElement(XmlUtils::parseRoot($xml, 'Redirect'));
    }

    /**
     * Reads a Redirect from an already-parsed <Redirect> element.
     *
     * @param XmlElement $element
     * @throws InvalidArgumentException
     */
    public static function fromXmlElement(XmlElement $element): self
    {
        XmlUtils::requireName($element, 'Redirect');
        $result = new self([
            'url' => XmlUtils::requireText($element),
            'method' => XmlUtils::requireAttribute($element, 'method'),
            'kind' => XmlUtils::parseLiteral($element->getAttribute('kind'), 'redirect'),
        ]);
        $result->setAdditionalAttributes(XmlUtils::additionalAttributes($element, ['method', 'kind']));
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
