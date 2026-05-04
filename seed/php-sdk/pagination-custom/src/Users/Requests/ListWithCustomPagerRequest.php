<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListWithCustomPagerRequest extends JsonSerializableType
{
    /**
     * @var ?int $limit The maximum number of results to return.
     */
    public ?int $limit;

    /**
     * @var ?string $startingAfter The cursor used for pagination.
     */
    public ?string $startingAfter;

    /**
     * @param array{
     *   limit?: ?int,
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->limit = $values['limit'] ?? null;
        $this->startingAfter = $values['startingAfter'] ?? null;
    }
}
