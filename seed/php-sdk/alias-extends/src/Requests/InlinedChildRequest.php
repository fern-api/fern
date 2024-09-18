<?php

namespace Seed\Requests;

use Seed\Core\JsonProperty;

class InlinedChildRequest
{
    /**
     * @var string $child
     */
    #[JsonProperty("child")]
    public string $child;

}
