<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListAuditLogsRequest extends JsonSerializableType
{
    /**
     * @var ?int $offset
     */
    public ?int $offset;

    /**
     * @var ?bool $includeResolved
     */
    public ?bool $includeResolved;

    /**
     * @var ?string $filter
     */
    public ?string $filter;

    /**
     * @var ?int $xMaxResults
     */
    public ?int $xMaxResults;

    /**
     * @var ?bool $xIncludeResolved
     */
    public ?bool $xIncludeResolved;

    /**
     * @param array{
     *   offset?: ?int,
     *   includeResolved?: ?bool,
     *   filter?: ?string,
     *   xMaxResults?: ?int,
     *   xIncludeResolved?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->offset = $values['offset'] ?? null;
        $this->includeResolved = $values['includeResolved'] ?? null;
        $this->filter = $values['filter'] ?? null;
        $this->xMaxResults = $values['xMaxResults'] ?? null;
        $this->xIncludeResolved = $values['xIncludeResolved'] ?? null;
    }
}
