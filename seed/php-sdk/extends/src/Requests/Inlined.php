<?php

namespace Seed\Requests;

use Seed\Core\JsonProperty;

class Inlined
{
    /**
     * @var string $unique
     */
    #[JsonProperty("unique")]
    public string $unique;

    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var string $docs
     */
    #[JsonProperty("docs")]
    public string $docs;

}
