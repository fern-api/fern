<?php

namespace Seed\Products\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Products\Types\SearchProductsRequestConfig;

class SearchProductsRequest extends JsonSerializableType
{
    /**
     * @var ?string $query
     */
    #[JsonProperty('query')]
    public ?string $query;

    /**
     * @var ?SearchProductsRequestConfig $config
     */
    #[JsonProperty('config')]
    public ?SearchProductsRequestConfig $config;

    /**
     * @param array{
     *   query?: ?string,
     *   config?: ?SearchProductsRequestConfig,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->query = $values['query'] ?? null;
        $this->config = $values['config'] ?? null;
    }
}
