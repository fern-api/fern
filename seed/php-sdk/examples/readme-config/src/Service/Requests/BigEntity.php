<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Actor;
use Seed\Types\Actress;
use Seed\Types\StuntDouble;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;
use Seed\Types\ExtendedMovie;
use Seed\Types\Entity;
use Seed\Types\Metadata;
use Seed\Types\CommonsMetadata;
use Seed\Types\CommonsEventInfoZero;
use Seed\Types\CommonsEventInfoType;
use Seed\Types\CommonsData;
use Seed\Types\Migration;
use Seed\Types\ExceptionZero;
use Seed\Types\ExceptionType;
use Seed\Types\Test;
use Seed\Types\Node;
use Seed\Types\Directory;
use Seed\Types\Moment;

class BigEntity extends JsonSerializableType
{
    /**
     * @var (
     *    Actor
     *   |Actress
     *   |StuntDouble
     * )|null $castMember
     */
    #[JsonProperty('castMember'), Union(Actor::class, Actress::class, StuntDouble::class, 'null')]
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
     * @var ?CommonsMetadata $commonMetadata
     */
    #[JsonProperty('commonMetadata')]
    public ?CommonsMetadata $commonMetadata;

    /**
     * @var (
     *    CommonsEventInfoZero
     *   |CommonsEventInfoType
     * )|null $eventInfo
     */
    #[JsonProperty('eventInfo'), Union(CommonsEventInfoZero::class, CommonsEventInfoType::class, 'null')]
    public CommonsEventInfoZero|CommonsEventInfoType|null $eventInfo;

    /**
     * @var ?CommonsData $data
     */
    #[JsonProperty('data')]
    public ?CommonsData $data;

    /**
     * @var ?Migration $migration
     */
    #[JsonProperty('migration')]
    public ?Migration $migration;

    /**
     * @var (
     *    ExceptionZero
     *   |ExceptionType
     * )|null $exception
     */
    #[JsonProperty('exception'), Union(ExceptionZero::class, ExceptionType::class, 'null')]
    public ExceptionZero|ExceptionType|null $exception;

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
     *   commonMetadata?: ?CommonsMetadata,
     *   eventInfo?: (
     *    CommonsEventInfoZero
     *   |CommonsEventInfoType
     * )|null,
     *   data?: ?CommonsData,
     *   migration?: ?Migration,
     *   exception?: (
     *    ExceptionZero
     *   |ExceptionType
     * )|null,
     *   test?: ?Test,
     *   node?: ?Node,
     *   directory?: ?Directory,
     *   moment?: ?Moment,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->castMember = $values['castMember'] ?? null;
        $this->extendedMovie = $values['extendedMovie'] ?? null;
        $this->entity = $values['entity'] ?? null;
        $this->metadata = $values['metadata'] ?? null;
        $this->commonMetadata = $values['commonMetadata'] ?? null;
        $this->eventInfo = $values['eventInfo'] ?? null;
        $this->data = $values['data'] ?? null;
        $this->migration = $values['migration'] ?? null;
        $this->exception = $values['exception'] ?? null;
        $this->test = $values['test'] ?? null;
        $this->node = $values['node'] ?? null;
        $this->directory = $values['directory'] ?? null;
        $this->moment = $values['moment'] ?? null;
    }
}
