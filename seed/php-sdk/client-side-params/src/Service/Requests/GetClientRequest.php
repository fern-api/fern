<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetClientRequest extends JsonSerializableType
{
    /**
     * @var ?string $fields Comma-separated list of fields to include
     */
    public ?string $fields;

    /**
     * @var ?bool $includeFields Whether specified fields are included or excluded
     */
    public ?bool $includeFields;

    /**
     * @param array{
     *   fields?: ?string,
     *   includeFields?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->fields = $values['fields'] ?? null;$this->includeFields = $values['includeFields'] ?? null;
    }
}
