<?php

namespace <%= namespace%>;

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
}