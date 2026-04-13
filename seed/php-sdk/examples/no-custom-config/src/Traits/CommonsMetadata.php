<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

/**
 * @property string $id
 * @property ?array<string, ?string> $data
 * @property ?string $jsonString
 */
trait CommonsMetadata
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?array<string, ?string> $data
     */
    #[JsonProperty('data'), ArrayType(['string' => new Union('string', 'null')])]
    public ?array $data;

    /**
     * @var ?string $jsonString
     */
    #[JsonProperty('jsonString')]
    public ?string $jsonString;
}
