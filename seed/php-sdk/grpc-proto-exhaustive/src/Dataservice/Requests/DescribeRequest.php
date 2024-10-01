<?php

namespace Seed\Dataservice\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\Union;

class DescribeRequest extends SerializableType
{
    /**
     * @var array<string, float|string|bool>|array<string, mixed>|null $filter
     */
    #[JsonProperty('filter'), Union(['string' => new Union('float', 'string', 'bool')], ['string' => 'mixed'])]
    public array|null $filter;

    /**
     * @param array{
     *   filter?: array<string, float|string|bool>|array<string, mixed>|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->filter = $values['filter'] ?? null;
    }
}
