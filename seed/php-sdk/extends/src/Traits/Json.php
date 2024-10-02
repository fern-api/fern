<?php

namespace Seed\Traits;

use Seed\Core\JsonProperty;

trait Json
{
    use Docs;

    /**
     * @var string $raw
     */
    #[JsonProperty('raw')]
    public string $raw;
}
