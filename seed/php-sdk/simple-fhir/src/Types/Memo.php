<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Memo extends SerializableType
{
    /**
     * @var string $description
     */
    #[JsonProperty("description")]
    public string $description;

    /**
     * @var ?Account $account
     */
    #[JsonProperty("account")]
    public ?Account $account;

    /**
     * @param string $description
     * @param ?Account $account
     */
    public function __construct(
        string $description,
        ?Account $account = null,
    ) {
        $this->description = $description;
        $this->account = $account;
    }
}
