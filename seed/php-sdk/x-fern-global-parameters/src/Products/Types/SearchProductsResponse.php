<?php

namespace Seed\Products\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Product;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class SearchProductsResponse extends JsonSerializableType
{
    /**
     * @var ?array<Product> $results
     */
    #[JsonProperty('results'), ArrayType([Product::class])]
    public ?array $results;

    /**
     * @param array{
     *   results?: ?array<Product>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->results = $values['results'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
