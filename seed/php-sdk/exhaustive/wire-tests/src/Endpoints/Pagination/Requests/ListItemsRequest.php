<?php

namespace Seed\Endpoints\Pagination\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListItemsRequest extends JsonSerializableType
{
    /**
     * @var ?string $cursor The cursor for pagination
     */
    public ?string $cursor;

    /**
     * @var ?int $limit Maximum number of items to return
     */
    public ?int $limit;

    /**
     * @param array{
     *   cursor?: ?string,
     *   limit?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->cursor = $values['cursor'] ?? null;
        $this->limit = $values['limit'] ?? null;
    }
}
