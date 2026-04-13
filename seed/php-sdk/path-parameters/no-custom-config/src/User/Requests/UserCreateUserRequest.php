<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\User;

class UserCreateUserRequest extends JsonSerializableType
{
    /**
     * @var User $body
     */
    public User $body;

    /**
     * @param array{
     *   body: User,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
