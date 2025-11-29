<?php

namespace Seed\User\Events\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUserEventsRequest extends JsonSerializableType
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
    )
    {
        $this->limit = $values['limit'] ?? null;
    }
}
