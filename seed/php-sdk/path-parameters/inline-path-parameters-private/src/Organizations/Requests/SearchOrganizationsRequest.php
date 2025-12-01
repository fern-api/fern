<?php

namespace Seed\Organizations\Requests;

use Seed\Core\Json\JsonSerializableType;

class SearchOrganizationsRequest extends JsonSerializableType
{
    /**
     * @var ?int $limit
     */
    private ?int $limit;

    /**
     * @param array{
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->limit = $values['limit'] ?? null;
    }

    /**
     * @return ?int
     */
    public function getLimit(): ?int {
        return $this->limit;}

    /**
     * @param ?int $value
     */
    public function setLimit(?int $value = null): self {
        $this->limit = $value;return $this;}
}
