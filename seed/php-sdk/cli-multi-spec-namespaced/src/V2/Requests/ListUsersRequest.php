<?php

namespace Seed\V2\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsersRequest extends JsonSerializableType
{
    /**
     * @var ?int $pageSize
     */
    public ?int $pageSize;

    /**
     * @param array{
     *   pageSize?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->pageSize = $values['pageSize'] ?? null;
    }
}
