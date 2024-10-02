<?php

namespace Seed\Traits;

use Seed\Core\JsonProperty;

trait ExampleType
{
    use Docs;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;
}
