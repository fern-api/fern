<?php

namespace Seed\Core\Xml;

use BackedEnum;
use DateTime;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;
use InvalidArgumentException;
use Seed\Core\Json\JsonDeserializer;
use Seed\Core\Json\JsonSerializer;

/**
 * Helpers shared by generated XML types for serializing to and parsing from XML.
 */
final class XmlUtils
{
    private const XML_NAMESPACE_URI = 'http://www.w3.org/XML/1998/namespace';
    private const XMLNS_NAMESPACE_URI = 'http://www.w3.org/2000/xmlns/';

    // ---------------------------------------------------------------------------------------------
    // Serialization
    // ---------------------------------------------------------------------------------------------

    /**
     * Serializes an element tree to an XML string.
     */
    public static function serialize(XmlElement $element, bool $xmlDeclaration = false): string
    {
        $document = new DOMDocument('1.0', 'UTF-8');
        self::toDom($document, $document, $element);
        if ($xmlDeclaration) {
            $xml = $document->saveXML();
        } else {
            $root = $document->documentElement;
            $xml = $root === null ? false : $document->saveXML($root);
        }
        if ($xml === false) {
            throw new InvalidArgumentException("Could not serialize <{$element->name}> to XML");
        }
        return rtrim($xml, "\n");
    }

    /**
     * Builds the DOM node for $element and attaches it to $parent. The node is attached before
     * its children are created so libxml keeps namespace declarations on the element that owns
     * them instead of hoisting them onto a detached subtree root.
     */
    private static function toDom(DOMDocument $document, DOMDocument|DOMElement $parent, XmlElement $element): DOMElement
    {
        $qualifiedName = $element->prefix !== null && $element->prefix !== ''
            ? "{$element->prefix}:{$element->name}"
            : $element->name;
        $namespace = $element->namespace;
        $parentElement = $parent instanceof DOMElement ? $parent : null;
        if ($namespace === null && $element->prefix !== null && $parentElement !== null) {
            $namespace = $parentElement->lookupNamespaceURI($element->prefix);
        }
        if ($namespace === null && $parentElement !== null && $parentElement->lookupNamespaceURI(null) !== null) {
            // The parent declares a default namespace; reset it so this element stays unqualified.
            $namespace = '';
        }
        $node = $namespace !== null
            ? $document->createElementNS($namespace, $qualifiedName)
            : $document->createElement($qualifiedName);
        $parent->appendChild($node);

        foreach ($element->namespaceDeclarations as $prefix => $uri) {
            $inherited = $parentElement?->lookupNamespaceURI($prefix === '' ? null : $prefix);
            if ($inherited !== $uri) {
                $node->setAttributeNS(self::XMLNS_NAMESPACE_URI, $prefix === '' ? 'xmlns' : "xmlns:$prefix", $uri);
            }
        }
        foreach ($element->attributes as $name => $value) {
            if ($name === 'xmlns' || str_starts_with($name, 'xmlns:')) {
                self::setDomAttribute($node, $name, $value);
            }
        }
        foreach ($element->attributes as $name => $value) {
            if ($name !== 'xmlns' && !str_starts_with($name, 'xmlns:')) {
                self::setDomAttribute($node, $name, $value);
            }
        }
        if ($element->text !== null) {
            $node->appendChild($document->createTextNode($element->text));
        }
        foreach ($element->children as $child) {
            self::toDom($document, $node, $child->toXmlElement());
        }
        return $node;
    }

    private static function setDomAttribute(DOMElement $node, string $name, string $value): void
    {
        $colon = strpos($name, ':');
        if ($colon === false) {
            $node->setAttribute($name, $value);
            return;
        }
        $prefix = substr($name, 0, $colon);
        if ($prefix === 'xmlns') {
            $declared = substr($name, $colon + 1);
            $parent = $node->parentNode;
            $inherited = $parent instanceof DOMElement ? $parent->lookupNamespaceURI($declared) : null;
            if ($inherited !== $value) {
                $node->setAttributeNS(self::XMLNS_NAMESPACE_URI, $name, $value);
            }
            return;
        }
        $namespace = $prefix === 'xml' ? self::XML_NAMESPACE_URI : $node->lookupNamespaceURI($prefix);
        if ($namespace === null) {
            $node->setAttribute($name, $value);
            return;
        }
        $node->setAttributeNS($namespace, $name, $value);
    }

    /**
     * Adds unknown attributes and children back onto an element. Unknown content that was found
     * inside a wrapper element (see $wrapperNames) is merged into the wrapper of the same name
     * instead of producing a second wrapper.
     *
     * @param array<string, string> $attributes
     * @param list<XmlNode> $children
     * @param list<string> $wrapperNames
     */
    public static function addAdditional(XmlElement $element, array $attributes, array $children, array $wrapperNames = []): void
    {
        foreach ($attributes as $name => $value) {
            if (!array_key_exists($name, $element->attributes)) {
                $element->attributes[$name] = $value;
            }
        }
        foreach ($children as $child) {
            if ($child instanceof XmlElement && in_array($child->name, $wrapperNames, true)) {
                $wrapper = $element->getChild($child->name);
                if ($wrapper !== null) {
                    foreach ($child->namespaceDeclarations as $prefix => $uri) {
                        $wrapper->namespaceDeclarations[$prefix] ??= $uri;
                    }
                    foreach ($child->attributes as $name => $value) {
                        if (!array_key_exists($name, $wrapper->attributes)) {
                            $wrapper->attributes[$name] = $value;
                        }
                    }
                    $wrapper->text ??= $child->text;
                    foreach ($child->children as $grandChild) {
                        $wrapper->addChild($grandChild);
                    }
                    continue;
                }
            }
            $element->addChild($child);
        }
    }

    /**
     * Appends an empty wrapper element and returns it.
     */
    public static function addWrapper(XmlElement $element, string $name): XmlElement
    {
        $wrapper = new XmlElement($name);
        $element->addChild($wrapper);
        return $wrapper;
    }

    /**
     * Appends a child element carrying only text.
     */
    public static function addChildValue(XmlElement $element, string $name, ?string $value): void
    {
        if ($value === null) {
            return;
        }
        $element->addChild(new XmlElement($name, $value));
    }

    /**
     * Converts a scalar to its XML text representation. DateTime values use RFC 3339.
     */
    public static function toXmlString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        if (is_string($value)) {
            return $value;
        }
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }
        if (is_int($value)) {
            return (string) $value;
        }
        if (is_float($value)) {
            return self::formatFloat($value);
        }
        if ($value instanceof BackedEnum) {
            return (string) $value->value;
        }
        if ($value instanceof DateTime) {
            return JsonSerializer::serializeDateTime($value);
        }
        throw new InvalidArgumentException('Cannot convert value of type ' . get_debug_type($value) . ' to an XML string');
    }

    /**
     * Converts a date (without time) to its XML text representation (`Y-m-d`).
     */
    public static function toXmlDateString(?DateTime $value): ?string
    {
        return $value === null ? null : JsonSerializer::serializeDate($value);
    }

    private static function formatFloat(float $value): string
    {
        $string = (string) $value;
        return str_contains($string, '.') || str_contains($string, 'E') || !is_finite($value) ? $string : "$string.0";
    }

    /**
     * Joins scalar values with a separator (for separator-delimited list attributes and text).
     *
     * @param ?iterable<mixed> $values
     */
    public static function joinValues(?iterable $values, string $separator): ?string
    {
        if ($values === null) {
            return null;
        }
        $parts = [];
        foreach ($values as $value) {
            $string = self::toXmlString($value);
            if ($string !== null) {
                $parts[] = $string;
            }
        }
        return implode($separator, $parts);
    }

    /**
     * @param ?iterable<?DateTime> $values
     */
    public static function joinDateValues(?iterable $values, string $separator): ?string
    {
        if ($values === null) {
            return null;
        }
        $parts = [];
        foreach ($values as $value) {
            $string = self::toXmlDateString($value);
            if ($string !== null) {
                $parts[] = $string;
            }
        }
        return implode($separator, $parts);
    }

    // ---------------------------------------------------------------------------------------------
    // Parsing
    // ---------------------------------------------------------------------------------------------

    /**
     * Parses an XML document into a generic element tree. DOCTYPE declarations are rejected so
     * that entity expansion and external entity attacks are not possible.
     *
     * @throws InvalidArgumentException If the XML is malformed.
     */
    public static function parseDocument(string $xml): XmlElement
    {
        if (trim($xml) === '') {
            throw new InvalidArgumentException('Cannot parse XML from an empty string');
        }
        // Only the prolog (before the root element) can legitimately hold a DOCTYPE; checking there
        // avoids false positives on CDATA or text that merely contains the string.
        if (preg_match('/^\s*(?:<\?.*?\?>\s*|<!--.*?-->\s*)*<!DOCTYPE/is', $xml) === 1) {
            throw new InvalidArgumentException('XML documents with a DOCTYPE declaration are not allowed');
        }
        $previous = libxml_use_internal_errors(true);
        try {
            $document = new DOMDocument();
            $loaded = $document->loadXML($xml, LIBXML_NONET | LIBXML_NOCDATA);
            $errors = libxml_get_errors();
            libxml_clear_errors();
        } finally {
            libxml_use_internal_errors($previous);
        }
        if (!$loaded || $document->documentElement === null) {
            $messages = array_map(fn ($error) => trim($error->message), $errors);
            throw new InvalidArgumentException('Malformed XML: ' . (implode('; ', $messages) ?: 'no root element'));
        }
        if ($document->doctype !== null) {
            throw new InvalidArgumentException('XML documents with a DOCTYPE declaration are not allowed');
        }
        return self::fromDom($document->documentElement);
    }

    /**
     * Parses an XML document and checks that its root element has the expected name (and namespace, if given).
     *
     * @throws InvalidArgumentException If the XML is malformed or the root element does not match.
     */
    public static function parseRoot(string $xml, string $expectedName, ?string $expectedNamespace = null): XmlElement
    {
        $root = self::parseDocument($xml);
        self::requireName($root, $expectedName, $expectedNamespace);
        return $root;
    }

    /**
     * @throws InvalidArgumentException If the element's name (or namespace, if given) does not match.
     * Unqualified elements are accepted for any expected namespace; only an explicitly different
     * namespace is rejected, since many producers emit XML without namespace declarations.
     */
    public static function requireName(XmlElement $element, string $expectedName, ?string $expectedNamespace = null): void
    {
        if ($element->name !== $expectedName) {
            throw new InvalidArgumentException("Expected <$expectedName> element but found <{$element->name}>");
        }
        if ($expectedNamespace !== null && $element->namespace !== null && $element->namespace !== $expectedNamespace) {
            throw new InvalidArgumentException("Expected <$expectedName> in namespace '$expectedNamespace' but found namespace '{$element->namespace}'");
        }
    }

    private static function fromDom(DOMElement $node): XmlElement
    {
        $element = new XmlElement(
            name: $node->localName ?? $node->nodeName,
            namespace: $node->namespaceURI,
            prefix: $node->prefix === '' ? null : $node->prefix,
        );
        $attributes = $node->attributes;
        if ($attributes !== null) {
            foreach ($attributes as $attribute) {
                if (!$attribute instanceof \DOMAttr) {
                    continue;
                }
                $element->attributes[$attribute->nodeName] = $attribute->value;
                if ($attribute->prefix !== '' && $attribute->prefix !== 'xml' && $attribute->namespaceURI !== null) {
                    $element->namespaceDeclarations[$attribute->prefix] = $attribute->namespaceURI;
                }
            }
        }
        $text = '';
        foreach ($node->childNodes as $child) {
            if ($child instanceof DOMText) {
                $text .= $child->wholeText;
            } elseif ($child instanceof DOMElement) {
                $element->addChild(self::fromDom($child));
            }
        }
        // Text nodes are concatenated (whitespace-only text is dropped); interleaving with child
        // elements is not preserved, matching toDom() which writes text before children.
        $element->text = trim($text) === '' ? null : $text;
        return $element;
    }

    /**
     * @throws InvalidArgumentException If the attribute is missing.
     */
    public static function requireAttribute(XmlElement $element, string $name): string
    {
        $value = $element->getAttribute($name);
        if ($value === null) {
            throw new InvalidArgumentException("Missing required attribute '$name' on <{$element->name}>");
        }
        return $value;
    }

    public static function getText(XmlElement $element): ?string
    {
        return $element->text;
    }

    /**
     * @throws InvalidArgumentException If the element has no text content.
     */
    public static function requireText(XmlElement $element): string
    {
        if ($element->text === null) {
            throw new InvalidArgumentException("Missing required text content on <{$element->name}>");
        }
        return $element->text;
    }

    public static function getChildText(XmlElement $element, string $name): ?string
    {
        $child = $element->getChild($name);
        return $child === null ? null : ($child->text ?? '');
    }

    /**
     * @throws InvalidArgumentException If the child element is missing.
     */
    public static function requireChildText(XmlElement $element, string $name): string
    {
        $child = $element->getChild($name);
        if ($child === null) {
            throw self::missingChild($element, [$name]);
        }
        return $child->text ?? '';
    }

    /**
     * @param list<string> $names
     */
    public static function missingChild(XmlElement $element, array $names): InvalidArgumentException
    {
        $expected = implode('> or <', $names);
        return new InvalidArgumentException("Missing required child <$expected> on <{$element->name}>");
    }

    public static function unexpectedElement(XmlElement $element): InvalidArgumentException
    {
        return new InvalidArgumentException("Unexpected element <{$element->name}>");
    }

    /**
     * Applies a parser to a raw value when it is present.
     *
     * @template T
     * @param callable(string): T $parse
     * @return ?T
     */
    public static function mapOptional(?string $raw, callable $parse): mixed
    {
        return $raw === null ? null : $parse($raw);
    }

    /**
     * Splits a separator-delimited value and parses each item.
     *
     * @template T
     * @param non-empty-string $separator
     * @param callable(string): T $parse
     * @return ($raw is null ? null : list<T>)
     */
    public static function parseList(?string $raw, string $separator, callable $parse): ?array
    {
        if ($raw === null) {
            return null;
        }
        $result = [];
        foreach (explode($separator, $raw) as $item) {
            if ($item === '') {
                continue;
            }
            $result[] = $parse($item);
        }
        return $result;
    }

    /**
     * Returns the wrapper element of a wrapped list, throwing when it is missing.
     */
    public static function requireWrapper(XmlElement $element, string $name): XmlElement
    {
        $wrapper = $element->getChild($name);
        if ($wrapper === null) {
            throw self::missingChild($element, [$name]);
        }
        return $wrapper;
    }

    /**
     * Parses the text of every child element with the given name. Returns null when $parent is null
     * (an absent optional wrapper).
     *
     * @template T
     * @param callable(string): T $parse
     * @return ($parent is null ? null : list<T>)
     */
    public static function parseChildValues(?XmlElement $parent, string $name, callable $parse): ?array
    {
        if ($parent === null) {
            return null;
        }
        $result = [];
        foreach ($parent->getChildren($name) as $child) {
            $result[] = $parse($child->text ?? '');
        }
        return $result;
    }

    /**
     * Parses every child element whose name has a parser, in document order. Returns null when $parent
     * is null (an absent optional wrapper).
     *
     * @template T
     * @param array<string, callable(XmlElement): T> $parsers Keyed by element name.
     * @return ($parent is null ? null : list<T>)
     */
    public static function parseChildren(?XmlElement $parent, array $parsers): ?array
    {
        if ($parent === null) {
            return null;
        }
        $result = [];
        foreach ($parent->children as $child) {
            $element = $child->toXmlElement();
            $parse = $parsers[$element->name] ?? null;
            if ($parse !== null) {
                $result[] = $parse($element);
            }
        }
        return $result;
    }

    /**
     * Parses the first child element whose name has a parser.
     *
     * @template T
     * @param array<string, callable(XmlElement): T> $parsers Keyed by element name.
     * @return ?T
     */
    public static function parseChild(XmlElement $parent, array $parsers): mixed
    {
        foreach ($parent->children as $child) {
            $element = $child->toXmlElement();
            $parse = $parsers[$element->name] ?? null;
            if ($parse !== null) {
                return $parse($element);
            }
        }
        return null;
    }

    /**
     * Parses the first child element whose name has a parser, failing if there is none.
     *
     * @template T
     * @param array<string, callable(XmlElement): T> $parsers Keyed by element name.
     * @return T
     * @throws InvalidArgumentException If no matching child exists.
     */
    public static function requireChild(XmlElement $parent, array $parsers): mixed
    {
        foreach ($parent->children as $child) {
            $element = $child->toXmlElement();
            $parse = $parsers[$element->name] ?? null;
            if ($parse !== null) {
                return $parse($element);
            }
        }
        throw self::missingChild($parent, array_keys($parsers));
    }

    public static function parseString(string $raw): string
    {
        return $raw;
    }

    /**
     * @throws InvalidArgumentException If the value is not an integer.
     */
    public static function parseInt(string $raw): int
    {
        $trimmed = trim($raw);
        if (preg_match('/^[+-]?\d+$/', $trimmed) !== 1) {
            throw new InvalidArgumentException("Cannot parse '$raw' as an integer");
        }
        return (int) $trimmed;
    }

    /**
     * @throws InvalidArgumentException If the value is not numeric.
     */
    public static function parseFloat(string $raw): float
    {
        $trimmed = trim($raw);
        if (!is_numeric($trimmed)) {
            throw new InvalidArgumentException("Cannot parse '$raw' as a number");
        }
        return (float) $trimmed;
    }

    /**
     * @throws InvalidArgumentException If the value is not a boolean.
     */
    public static function parseBool(string $raw): bool
    {
        return match (strtolower(trim($raw))) {
            'true', '1' => true,
            'false', '0' => false,
            default => throw new InvalidArgumentException("Cannot parse '$raw' as a boolean"),
        };
    }

    public static function parseDate(string $raw): DateTime
    {
        return JsonDeserializer::deserializeDate(trim($raw));
    }

    public static function parseDateTime(string $raw): DateTime
    {
        return JsonDeserializer::deserializeDateTime(trim($raw));
    }

    /**
     * Validates that a raw value is one of the enum's backing values and returns it unchanged.
     *
     * @template T of BackedEnum
     * @param class-string<T> $enum
     * @return ($raw is null ? null : T)
     * @throws InvalidArgumentException If the value is not a member of the enum.
     */
    public static function parseEnum(?string $raw, string $enum): ?BackedEnum
    {
        if ($raw === null) {
            return null;
        }
        $case = $enum::tryFrom($raw);
        if ($case === null) {
            throw new InvalidArgumentException("'$raw' is not a valid value for $enum");
        }
        return $case;
    }

    /**
     * Validates that a raw value spells the expected string literal and returns the literal.
     *
     * @template T of string
     * @param T $expected
     * @return ($raw is null ? null : T)
     * @throws InvalidArgumentException If the value differs from the literal.
     */
    public static function parseLiteral(?string $raw, string $expected): ?string
    {
        if ($raw === null) {
            return null;
        }
        if (trim($raw) !== $expected) {
            throw new InvalidArgumentException("Expected literal '$expected' but found '$raw'");
        }
        return $expected;
    }

    /**
     * Validates that a raw value spells the expected boolean literal and returns the literal.
     *
     * @template T of bool
     * @param T $expected
     * @return ($raw is null ? null : T)
     * @throws InvalidArgumentException If the value differs from the literal.
     */
    public static function parseBoolLiteral(?string $raw, bool $expected): ?bool
    {
        if ($raw === null) {
            return null;
        }
        if (self::parseBool($raw) !== $expected) {
            throw new InvalidArgumentException("Expected literal '" . ($expected ? 'true' : 'false') . "' but found '$raw'");
        }
        return $expected;
    }

    /**
     * Validates every raw item against the enum's backing values.
     *
     * @template T of BackedEnum
     * @param ?list<string> $raw
     * @param class-string<T> $enum
     * @return ($raw is null ? null : list<value-of<T>>)
     * @throws InvalidArgumentException If an item is not a member of the enum.
     */
    public static function enumValues(?array $raw, string $enum): ?array
    {
        if ($raw === null) {
            return null;
        }
        $result = [];
        foreach ($raw as $item) {
            $result[] = self::parseEnum($item, $enum)->value;
        }
        return $result;
    }

    /**
     * @param list<string> $knownNames
     * @return array<string, string> Attributes other than namespace declarations and the known names.
     */
    public static function additionalAttributes(XmlElement $element, array $knownNames): array
    {
        $result = [];
        foreach ($element->attributes as $name => $value) {
            if (in_array($name, $knownNames, true) || $name === 'xmlns' || str_starts_with($name, 'xmlns:')) {
                continue;
            }
            $result[$name] = $value;
            // Keep the declaration a prefixed unknown attribute depends on so it stays well-formed.
            $colon = strpos($name, ':');
            $prefix = $colon === false ? null : substr($name, 0, $colon);
            $uri = $prefix === null ? null : $element->namespaceDeclarations[$prefix] ?? null;
            if ($uri !== null) {
                $result["xmlns:$prefix"] = $uri;
            }
        }
        return $result;
    }

    /**
     * Collects the child elements that the typed model does not know about. For wrapper elements,
     * a copy carrying only the wrapper's unknown attributes, text and items is kept.
     *
     * @param list<string> $knownNames
     * @param array<string, list<string>> $wrappers Known item names per wrapper element name.
     * @return list<XmlNode>
     */
    public static function additionalChildren(XmlElement $element, array $knownNames, array $wrappers = []): array
    {
        $result = [];
        foreach ($element->children as $child) {
            $childElement = $child->toXmlElement();
            if (in_array($childElement->name, $knownNames, true)) {
                continue;
            }
            $knownItems = $wrappers[$childElement->name] ?? null;
            if ($knownItems === null) {
                $result[] = $child;
                continue;
            }
            $rest = new XmlElement(
                name: $childElement->name,
                text: $childElement->text,
                attributes: $childElement->attributes,
                namespace: $childElement->namespace,
                prefix: $childElement->prefix,
            );
            $rest->namespaceDeclarations = $childElement->namespaceDeclarations;
            foreach ($childElement->children as $item) {
                if (!in_array($item->toXmlElement()->name, $knownItems, true)) {
                    $rest->addChild($item);
                }
            }
            if ($rest->text !== null || count($rest->attributes) > 0 || count($rest->children) > 0) {
                $result[] = $rest;
            }
        }
        return $result;
    }
}
