<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CreateResponse extends SerializableType
{
    /**
     * @var ?UserModel $user
     */
    #[JsonProperty("user")]
    public ?UserModel $user;

    /**
     * @param ?UserModel $user
     */
    public function __construct(
        ?UserModel $user = null,
    ) {
        $this->user = $user;
    }
}
