<?php

namespace Seed\Organizations\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetOrganizationUserRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    public string $tenantId;

    /**
     * @var string $organizationId
     */
    public string $organizationId;

    /**
     * @var string $userId
     */
    public string $userId;

    /**
     * @param array{
     *   tenantId: string,
     *   organizationId: string,
     *   userId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->organizationId = $values['organizationId'];$this->userId = $values['userId'];
    }
}
