<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

trait Json
{
    use Docs;

    /**
     * @var string $raw
     */
    #[JsonProperty('raw')]
    public string $raw;
}
