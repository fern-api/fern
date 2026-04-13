<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\User;

class UserCreateUserRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    public string $tenantId;

    /**
     * @var User $body
     */
    public User $body;

    /**
     * @param array{
     *   tenantId: string,
     *   body: User,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->tenantId = $values['tenantId'];
        $this->body = $values['body'];
    }
}
