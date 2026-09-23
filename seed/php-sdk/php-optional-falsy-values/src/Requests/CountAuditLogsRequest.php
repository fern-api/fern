<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;

class CountAuditLogsRequest extends JsonSerializableType
{
    /**
     * @var ?bool $resolvedOnly
     */
    public ?bool $resolvedOnly;

    /**
     * @param array{
     *   resolvedOnly?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->resolvedOnly = $values['resolvedOnly'] ?? null;
    }
}
