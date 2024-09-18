<?php

namespace Seed\Foo\Requests;

use Seed\Core\JsonProperty;

class FindRequest
{
    /**
     * @var ?string $optionalString
     */
    public ?string $optionalString;

    /**
     * @var ?string $publicProperty
     */
    #[JsonProperty("publicProperty")]
    public ?string $publicProperty;

    /**
     * @var ?int $privateProperty
     */
    #[JsonProperty("privateProperty")]
    public ?int $privateProperty;

    /**
     * @param ?string $optionalString
     * @param ?string $publicProperty
     * @param ?int $privateProperty
     */
    public function __construct(
        ?string $optionalString = null,
        ?string $publicProperty = null,
        ?int $privateProperty = null,
    ) {
        $this->optionalString = $optionalString;
        $this->publicProperty = $publicProperty;
        $this->privateProperty = $privateProperty;
    }
}
