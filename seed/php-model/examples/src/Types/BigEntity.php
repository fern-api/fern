<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Commons\Types\EventInfo;
use Seed\Commons\Types\Data;

class BigEntity extends JsonSerializableType
{
    /**
     * @var (
     *    Actor
     *   |Actress
     *   |StuntDouble
     * )|null $castMember
     */
    #[JsonProperty('castMember'), Union(Actor::class,Actress::class,StuntDouble::class,'null')]
    public Actor|Actress|StuntDouble|null $castMember;

    /**
     * @var ?ExtendedMovie $extendedMovie
     */
    #[JsonProperty('extendedMovie')]
    public ?ExtendedMovie $extendedMovie;

    /**
     * @var ?Entity $entity
     */
    #[JsonProperty('entity')]
    public ?Entity $entity;

    /**
     * @var ?Metadata $metadata
     */
    #[JsonProperty('metadata')]
    public ?Metadata $metadata;

    /**
     * @var ?\Seed\Commons\Types\Metadata $commonMetadata
     */
    #[JsonProperty('commonMetadata')]
    public ?\Seed\Commons\Types\Metadata $commonMetadata;

    /**
     * @var ?EventInfo $eventInfo
     */
    #[JsonProperty('eventInfo')]
    public ?EventInfo $eventInfo;

    /**
     * @var ?Data $data
     */
    #[JsonProperty('data')]
    public ?Data $data;

    /**
     * @var ?Migration $migration
     */
    #[JsonProperty('migration')]
    public ?Migration $migration;

    /**
     * @var ?Exception $exception
     */
    #[JsonProperty('exception')]
    public ?Exception $exception;

    /**
     * @var ?Test $test
     */
    #[JsonProperty('test')]
    public ?Test $test;

    /**
     * @var ?Node $node
     */
    #[JsonProperty('node')]
    public ?Node $node;

    /**
     * @var ?Directory $directory
     */
    #[JsonProperty('directory')]
    public ?Directory $directory;

    /**
     * @var ?Moment $moment
     */
    #[JsonProperty('moment')]
    public ?Moment $moment;

    /**
     * @param array{
     *   castMember?: (
     *    Actor
     *   |Actress
     *   |StuntDouble
     * )|null,
     *   extendedMovie?: ?ExtendedMovie,
     *   entity?: ?Entity,
     *   metadata?: ?Metadata,
     *   commonMetadata?: ?\Seed\Commons\Types\Metadata,
     *   eventInfo?: ?EventInfo,
     *   data?: ?Data,
     *   migration?: ?Migration,
     *   exception?: ?Exception,
     *   test?: ?Test,
     *   node?: ?Node,
     *   directory?: ?Directory,
     *   moment?: ?Moment,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->castMember = $values['castMember'] ?? null;$this->extendedMovie = $values['extendedMovie'] ?? null;$this->entity = $values['entity'] ?? null;$this->metadata = $values['metadata'] ?? null;$this->commonMetadata = $values['commonMetadata'] ?? null;$this->eventInfo = $values['eventInfo'] ?? null;$this->data = $values['data'] ?? null;$this->migration = $values['migration'] ?? null;$this->exception = $values['exception'] ?? null;$this->test = $values['test'] ?? null;$this->node = $values['node'] ?? null;$this->directory = $values['directory'] ?? null;$this->moment = $values['moment'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
