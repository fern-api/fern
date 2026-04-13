<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $userName
 * @property array<string> $metadataTags
 * @property array<string, string> $extraProperties
 */
trait User
{
    /**
     * @var string $userName
     */
    #[JsonProperty('userName')]
    public string $userName;

    /**
     * @var array<string> $metadataTags
     */
    #[JsonProperty('metadata_tags'), ArrayType(['string'])]
    public array $metadataTags;

    /**
     * @var array<string, string> $extraProperties
     */
    #[JsonProperty('EXTRA_PROPERTIES'), ArrayType(['string' => 'string'])]
    public array $extraProperties;
}
