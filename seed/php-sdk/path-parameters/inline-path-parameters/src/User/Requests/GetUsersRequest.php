<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUsersRequest extends JsonSerializableType
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
     * @param array{
     *   tenantId: string,
     *   userId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->userId = $values['userId'];
    }
}
