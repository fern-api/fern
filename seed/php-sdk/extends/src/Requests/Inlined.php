<?php

namespace Seed\Requests;

use Seed\Core\JsonProperty;

class Inlined
{
    /**
     * @var string $unique
     */
    #[JsonProperty("unique")]
    public string $unique;

}
