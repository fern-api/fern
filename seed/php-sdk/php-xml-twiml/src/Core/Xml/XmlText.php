<?php

namespace Seed\Core\Xml;

/**
 * A text segment inside an element's content. Used alongside child elements to keep
 * mixed content (text interleaved with elements) in document order.
 */
final class XmlText
{
    public function __construct(
        public string $text,
    ) {
    }

    public function __toString(): string
    {
        return $this->text;
    }
}
