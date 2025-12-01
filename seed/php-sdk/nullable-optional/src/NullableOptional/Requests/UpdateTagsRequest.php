<?php

namespace Seed\NullableOptional\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UpdateTagsRequest extends JsonSerializableType
{
    /**
     * @var ?array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    public ?array $tags;

    /**
     * @var ?array<string> $categories
     */
    #[JsonProperty('categories'), ArrayType(['string'])]
    public ?array $categories;

    /**
     * @var ?array<string> $labels
     */
    #[JsonProperty('labels'), ArrayType(['string'])]
    public ?array $labels;

    /**
     * @param array{
     *   tags?: ?array<string>,
     *   categories?: ?array<string>,
     *   labels?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->tags = $values['tags'] ?? null;$this->categories = $values['categories'] ?? null;$this->labels = $values['labels'] ?? null;
    }
}
