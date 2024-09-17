<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\UserModel;

class CreateResponse extends SerializableType
{
    #[JsonProperty("user")]
    /**
     * @var ?UserModel $user
     */
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
