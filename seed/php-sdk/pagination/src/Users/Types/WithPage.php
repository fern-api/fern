<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WithPage extends SerializableType
{
    #[JsonProperty("page")]
    /**
     * @var ?int $page
     */
    public ?int $page;

    /**
     * @param ?int $page
     */
    public function __construct(
        ?int $page = null,
    ) {
        $this->page = $page;
    }
}
