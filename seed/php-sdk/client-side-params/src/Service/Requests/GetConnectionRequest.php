<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetConnectionRequest extends JsonSerializableType
{
    /**
     * @var ?string $fields Comma-separated list of fields to include
     */
    public ?string $fields;

    /**
     * @param array{
     *   fields?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->fields = $values['fields'] ?? null;
    }
}
