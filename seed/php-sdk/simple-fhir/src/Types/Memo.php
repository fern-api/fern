<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\Account;

class Memo extends SerializableType
{
    #[JsonProperty("description")]
    /**
     * @var string $description
     */
    public string $description;

    #[JsonProperty("account")]
    /**
     * @var ?Account $account
     */
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
