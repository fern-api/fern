<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\User\Types\User;

class UpdateUserRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    public string $tenantId;

    /**
     * @var string $userId
     */
    public string $userId;

    /**
     * @var User $body
     */
    public User $body;

    /**
     * @param array{
     *   tenantId: string,
     *   userId: string,
     *   body: User,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->userId = $values['userId'];$this->body = $values['body'];
    }
}
