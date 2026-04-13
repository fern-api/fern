<?php

namespace Seed\UserEvents\Requests;

use Seed\Core\Json\JsonSerializableType;

class UserEventsListEventsRequest extends JsonSerializableType
{
    /**
     * @var ?int $limit The maximum number of results to return.
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
