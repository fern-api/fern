<?php

namespace Seed\Core;

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
