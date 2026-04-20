<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Link extends JsonSerializableType
{
    /**
     * @var string $rel
     */
    #[JsonProperty('rel')]
    public string $rel;

    /**
     * @var string $method
     */
    #[JsonProperty('method')]
    public string $method;

    /**
     * @var string $href
     */
    #[JsonProperty('href')]
    public string $href;

    /**
     * @param array{
     *   rel: string,
     *   method: string,
     *   href: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->rel = $values['rel'];
        $this->method = $values['method'];
        $this->href = $values['href'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
