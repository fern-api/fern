<?php

namespace Seed\Playlist\Traits;

use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property string $name
 * @property array<string> $problems
 */
trait PlaylistCreateRequest 
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var array<string> $problems
     */
    #[JsonProperty('problems'), ArrayType(['string'])]
    public array $problems;
}
