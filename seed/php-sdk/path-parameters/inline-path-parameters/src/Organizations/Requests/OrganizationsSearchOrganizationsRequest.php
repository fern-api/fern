<?php

namespace Seed\Organizations\Requests;

use Seed\Core\Json\JsonSerializableType;

class OrganizationsSearchOrganizationsRequest extends JsonSerializableType
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
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @param array{
     *   tenantId: string,
     *   organizationId: string,
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->tenantId = $values['tenantId'];
        $this->organizationId = $values['organizationId'];
        $this->limit = $values['limit'] ?? null;
    }
}
