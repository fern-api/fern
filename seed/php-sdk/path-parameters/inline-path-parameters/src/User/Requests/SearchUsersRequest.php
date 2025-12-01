<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class SearchUsersRequest extends JsonSerializableType
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
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @param array{
     *   tenantId: string,
     *   userId: string,
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->userId = $values['userId'];$this->limit = $values['limit'] ?? null;
    }
}
