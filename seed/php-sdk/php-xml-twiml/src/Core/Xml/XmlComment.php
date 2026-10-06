<?php

namespace Seed\Core\Xml;

/**
 * An XML comment (`<!--text-->`) inside an element's content. Kept alongside text segments and
 * child elements so comments stay in document order. The placement says whether the comment is
 * rendered inside the element at its position, or as a sibling immediately before or after the
 * element whose content holds it.
 */
final class XmlComment
{
    public const PLACEMENT_INSIDE = 'inside';
    public const PLACEMENT_BEFORE = 'before';
    public const PLACEMENT_AFTER = 'after';

    /**
     * @param string $text The comment text, written verbatim between `<!--` and `-->`.
     * @param self::PLACEMENT_* $placement
     */
    public function __construct(
        public string $text,
        public string $placement = self::PLACEMENT_INSIDE,
    ) {
    }

    /**
     * A comment rendered immediately before the element whose content holds it.
     */
    public static function before(string $text): self
    {
        return new self($text, self::PLACEMENT_BEFORE);
    }

    /**
     * A comment rendered immediately after the element whose content holds it.
     */
    public static function after(string $text): self
    {
        return new self($text, self::PLACEMENT_AFTER);
    }

    public function __toString(): string
    {
        return "<!--{$this->xmlText()}-->";
    }

    /**
     * The text as it is written inside the comment. XML forbids `--` within a comment and a trailing `-`,
     * and either would otherwise end the comment early and turn the rest into markup, so both are spaced out.
     */
    public function xmlText(): string
    {
        $safe = preg_replace('/-(?=-)/', '- ', $this->text) ?? $this->text;
        return str_ends_with($safe, '-') ? "$safe " : $safe;
    }
}
