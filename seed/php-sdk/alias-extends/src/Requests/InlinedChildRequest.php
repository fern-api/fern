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

    /**
     * @param string $child
     */
    public function __construct(
        string $child,
    ) {
        $this->child = $child;
    }
}
