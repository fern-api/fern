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
        // The root element and any sibling comments around it are written one by one, so libxml
        // does not insert line breaks between top-level nodes.
        $xml = $xmlDeclaration ? '<?xml version="1.0" encoding="UTF-8"?>' . "\n" : '';
        foreach ($document->childNodes as $node) {
            $saved = $document->saveXML($node);
            if ($saved === false) {
                throw new InvalidArgumentException("Could not serialize <{$element->name}> to XML");
            }
            $xml .= $saved;
        }
        return $xml;
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
        self::appendSiblingComments($document, $parent, $element, XmlComment::PLACEMENT_BEFORE);
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
            if ($child instanceof XmlText) {
                $node->appendChild($document->createTextNode($child->text));
            } elseif ($child instanceof XmlComment) {
                if ($child->placement === XmlComment::PLACEMENT_INSIDE) {
                    $node->appendChild($document->createComment($child->xmlText()));
                }
            } else {
                self::toDom($document, $node, $child->toXmlElement());
            }
        }
        self::appendSiblingComments($document, $parent, $element, XmlComment::PLACEMENT_AFTER);
        return $node;
    }

    /**
     * Writes the comments of $element with the given sibling placement (before/after) into $parent.
     */
    private static function appendSiblingComments(
        DOMDocument $document,
        DOMDocument|DOMElement $parent,
        XmlElement $element,
        string $placement,
    ): void {
        foreach ($element->children as $child) {
            if ($child instanceof XmlComment && $child->placement === $placement) {
                $parent->appendChild($document->createComment($child->xmlText()));
            }
        }
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
     * @param list<XmlNode|XmlText|XmlComment> $children
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
     * Appends the typed children, the additional children and the text segments to $element in
     * content order. $content decides the order; typed or additional children that are missing from
     * it are appended after it (typed first), so directly assigned properties still render. Wrapped
     * lists render as one wrapper element, placed where the first wrapper of that name or the first
     * item of that list appears in $content. Elements in $content that are neither typed, additional nor text are not written.
     *
     * @param list<XmlNode|XmlText|XmlComment> $content
     * @param list<XmlNode> $typed Typed child elements, in property order.
     * @param array<string, list<XmlNode>> $wrapped Items of each wrapped list, keyed by wrapper name.
     * @param list<XmlNode> $additional
     * @param array<string, string> $attributes Additional attributes.
     */
    public static function addContent(
        XmlElement $element,
        array $content,
        array $typed,
        array $wrapped,
        array $additional,
        array $attributes = [],
    ): void {
        $remaining = [];
        foreach ([...$typed, ...$additional] as $node) {
            $id = spl_object_id($node);
            $remaining[$id] = ($remaining[$id] ?? 0) + 1;
        }
        $wrapperOf = [];
        foreach ($wrapped as $name => $items) {
            foreach ($items as $item) {
                $wrapperOf[spl_object_id($item)] = $name;
            }
        }
        $wrappers = [];
        $emitWrapper = static function (string $name) use (&$wrappers, $element, $wrapped): void {
            if (isset($wrappers[$name])) {
                return;
            }
            $wrapper = self::addWrapper($element, $name);
            foreach ($wrapped[$name] as $item) {
                $wrapper->addChild($item);
            }
            $wrappers[$name] = $wrapper;
        };
        foreach ($content as $node) {
            if ($node instanceof XmlText || $node instanceof XmlComment) {
                $element->addChild($node);
                continue;
            }
            $id = spl_object_id($node);
            if (($remaining[$id] ?? 0) > 0) {
                $remaining[$id]--;
                $element->addChild($node);
                continue;
            }
            if (isset($wrapperOf[$id])) {
                $emitWrapper($wrapperOf[$id]);
            } elseif ($node instanceof XmlElement && array_key_exists($node->name, $wrapped)) {
                $emitWrapper($node->name);
            }
        }
        foreach ($typed as $node) {
            $id = spl_object_id($node);
            if (($remaining[$id] ?? 0) > 0) {
                $remaining[$id]--;
                $element->addChild($node);
            }
        }
        foreach (array_keys($wrapped) as $name) {
            $emitWrapper($name);
        }
        $leftover = [];
        foreach ($additional as $node) {
            $id = spl_object_id($node);
            if (($remaining[$id] ?? 0) > 0) {
                $remaining[$id]--;
                $leftover[] = $node;
            }
        }
        self::addAdditional($element, $attributes, $leftover, array_keys($wrapped));
    }

    /**
     * Builds the content list of a parsed element: its text segments, the typed children (taken in
     * document order from $typed), wrapper elements (as parsed) and the additional children.
     *
     * @param list<array{list<string>, list<XmlNode>}> $typed Pairs of element names and the typed
     *   children parsed from elements with those names, in document order.
     * @param list<XmlNode> $additional
     * @param list<string> $wrapperNames
     * @param bool $includeText Whether the element's text (character data before its first child) is part
     *   of the content. False for types with a text property, which holds that text instead.
     * @return list<XmlNode|XmlText|XmlComment>
     */
    public static function content(XmlElement $element, array $typed, array $additional, array $wrapperNames = [], bool $includeText = false): array
    {
        $byName = [];
        foreach ($typed as $index => [$names, $nodes]) {
            foreach ($names as $name) {
                $byName[$name] = $index;
            }
        }
        $positions = array_fill(0, count($typed), 0);
        $additionalIds = [];
        foreach ($additional as $node) {
            $additionalIds[spl_object_id($node)] = true;
        }
        $result = [];
        if ($includeText && $element->text !== null) {
            $result[] = new XmlText($element->text);
        }
        foreach ($element->children as $child) {
            if ($child instanceof XmlText || $child instanceof XmlComment) {
                $result[] = $child;
                continue;
            }
            $name = $child->toXmlElement()->name;
            $index = $byName[$name] ?? null;
            if ($index !== null) {
                $node = $typed[$index][1][$positions[$index]] ?? null;
                if ($node !== null) {
                    $positions[$index]++;
                    $result[] = $node;
                }
                continue;
            }
            if (in_array($name, $wrapperNames, true) || isset($additionalIds[spl_object_id($child)])) {
                $result[] = $child;
            }
        }
        return $result;
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
     * Normalizes an enum-valued attribute or text given either as the enum case or as its value.
     */
    public static function enumValue(BackedEnum|string|null $value): ?string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }

    /**
     * Normalizes a list-valued attribute or text given either as an array (of values or enum cases)
     * or as a single separator-delimited string (e.g. `'speech dtmf'`).
     *
     * @template T
     * @param array<T|BackedEnum>|string|null $value
     * @param non-empty-string $separator
     * @return ?array<T>
     */
    public static function toList(array|string|null $value, string $separator): ?array
    {
        if ($value === null) {
            return null;
        }
        if (is_array($value)) {
            /** @var array<T> $items */
            $items = array_map(fn ($item) => $item instanceof BackedEnum ? $item->value : $item, $value);
            return $items;
        }
        /** @var array<T> $items */
        $items = self::parseList($value, $separator, fn (string $item): string => $item);
        return $items;
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
        $hasElement = false;
        foreach ($node->childNodes as $child) {
            if ($child instanceof DOMText) {
                if ($hasElement) {
                    self::appendParsedText($element, $child->wholeText);
                } else {
                    $text .= $child->wholeText;
                }
            } elseif ($child instanceof DOMElement) {
                $hasElement = true;
                $element->addChild(self::fromDom($child));
            } elseif ($child instanceof \DOMComment) {
                $hasElement = true;
                $element->addChild(new XmlComment($child->data));
            }
        }
        // Text before the first child element or comment is the element's text (dropped when
        // whitespace-only); text between and after them is kept as XmlText segments in document order.
        $element->text = trim($text) === '' ? null : $text;
        return $element;
    }

    /**
     * Appends character data read after a child element. Whitespace-only text spanning a line break
     * is pretty-print indentation and is dropped; adjacent segments are merged.
     */
    private static function appendParsedText(XmlElement $element, string $text): void
    {
        if (self::isIndentation($text)) {
            return;
        }
        $count = count($element->children);
        $last = $count > 0 ? $element->children[$count - 1] : null;
        if ($last instanceof XmlText) {
            $last->text .= $text;
            return;
        }
        $element->addText($text);
    }

    /**
     * Whether $text is whitespace-only and spans a line break (pretty-print indentation).
     */
    private static function isIndentation(string $text): bool
    {
        return trim($text) === '' && preg_match('/[\r\n]/', $text) === 1;
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
            if ($child instanceof XmlText || $child instanceof XmlComment) {
                continue;
            }
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
            if ($child instanceof XmlText || $child instanceof XmlComment) {
                continue;
            }
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
            if ($child instanceof XmlText || $child instanceof XmlComment) {
                continue;
            }
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
     * Reads an enum-valued attribute or text. Enums are open on the wire: a value the enum does not
     * declare is returned unchanged, so documents written by a newer API version still parse and
     * round-trip.
     *
     * @template T of BackedEnum
     * @param class-string<T> $enum
     * @return ($raw is null ? null : value-of<T>)
     */
    public static function parseEnumValue(?string $raw, string $enum): mixed
    {
        if ($raw === null) {
            return null;
        }
        /** @var value-of<T> $value */
        $value = $enum::tryFrom($raw)?->value ?? $raw;
        return $value;
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
     * Reads a list of enum values; unknown items are kept as-is (see {@see parseEnumValue}).
     *
     * @template T of BackedEnum
     * @param ?list<string> $raw
     * @param class-string<T> $enum
     * @return ($raw is null ? null : list<value-of<T>>)
     */
    public static function enumValues(?array $raw, string $enum): ?array
    {
        if ($raw === null) {
            return null;
        }
        $result = [];
        foreach ($raw as $item) {
            $result[] = self::parseEnumValue($item, $enum);
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
            if ($child instanceof XmlText || $child instanceof XmlComment) {
                continue;
            }
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
                if ($item instanceof XmlText || $item instanceof XmlComment || !in_array($item->toXmlElement()->name, $knownItems, true)) {
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
