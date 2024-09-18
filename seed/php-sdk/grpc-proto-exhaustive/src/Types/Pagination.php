<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Pagination extends SerializableType
{
    #[JsonProperty("next")]
    /**
     * @var ?string $next
     */
    public ?string $next;

    /**
     * @param ?string $next
     */
    public function __construct(
        ?string $next = null,
    ) {
        $this->next = $next;
    }
}
