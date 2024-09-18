<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NextPage extends SerializableType
{
    #[JsonProperty("page")]
    /**
     * @var int $page
     */
    public int $page;

    #[JsonProperty("starting_after")]
    /**
     * @var string $startingAfter
     */
    public string $startingAfter;

    /**
     * @param int $page
     * @param string $startingAfter
     */
    public function __construct(
        int $page,
        string $startingAfter,
    ) {
        $this->page = $page;
        $this->startingAfter = $startingAfter;
    }
}
