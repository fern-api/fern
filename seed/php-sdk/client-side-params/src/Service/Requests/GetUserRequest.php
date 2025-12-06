<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUserRequest extends JsonSerializableType
{
    /**
     * @var ?string $fields Comma-separated list of fields to include or exclude
     */
    public ?string $fields;

    /**
     * @var ?bool $includeFields true to include the fields specified, false to exclude them
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
