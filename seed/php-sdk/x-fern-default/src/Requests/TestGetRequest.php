<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;

class TestGetRequest extends JsonSerializableType
{
    /**
     * @var ?string $limit
     */
    public ?string $limit = '100';

    /**
     * @param array{
     *   limit?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->limit = $values['limit'] ?? null;
    }
}
