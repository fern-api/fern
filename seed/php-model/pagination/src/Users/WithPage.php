<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WithPage extends SerializableType
{
    /**
     * @var ?int $page
     */
    #[JsonProperty("page")]
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
