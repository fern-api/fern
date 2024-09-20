<?php

namespace <%= coreNamespace%>;

class Union
{
    /**
     * @var string[]
     */
    public array $types;

    public function __construct(string ...$strings)
    {
        $this->types = $strings;
    }

    public function __toString(): string {
        return implode(' | ', $this->types);
    }
}
 