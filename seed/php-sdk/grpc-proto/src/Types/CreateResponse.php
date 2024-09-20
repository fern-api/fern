<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CreateResponse extends SerializableType
{
    /**
     * @var ?UserModel $user
     */
    #[JsonProperty('user')]
    public ?UserModel $user;

    /**
     * @param array{
     *   user?: ?UserModel,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->user = $values['user'] ?? null;
    }
}
