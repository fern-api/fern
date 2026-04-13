<?php

namespace Seed\Organizations\Requests;

use Seed\Core\Json\JsonSerializableType;

class OrganizationsSearchOrganizationsRequest extends JsonSerializableType
{
    /**
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @param array{
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->limit = $values['limit'] ?? null;
    }
}
