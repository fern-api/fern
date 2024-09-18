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

}
