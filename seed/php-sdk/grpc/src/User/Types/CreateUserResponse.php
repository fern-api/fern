<?php

namespace Seed\User\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class CreateUserResponse extends SerializableType
{
    /**
     * @var User $user
     */
    #[JsonProperty('user')]
    public User $user;

    /**
     * @param array{
     *   user: User,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->user = $values['user'];
    }
}
