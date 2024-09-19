<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NextPage extends SerializableType
{
    /**
     * @var int $page
     */
    #[JsonProperty("page")]
    public int $page;

    /**
     * @var string $startingAfter
     */
    #[JsonProperty("starting_after")]
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
