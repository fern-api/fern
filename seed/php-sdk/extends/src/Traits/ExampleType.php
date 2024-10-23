<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

trait ExampleType
{
    use Docs;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;
}
