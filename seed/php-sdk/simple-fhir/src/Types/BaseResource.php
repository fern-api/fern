<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class BaseResource extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var array<(
     *    Account
     *   |Patient
     *   |Practitioner
     *   |Script
     * )> $relatedResources
     */
    #[JsonProperty('related_resources'), ArrayType([new Union(Account::class, Patient::class, Practitioner::class, Script::class)])]
    public array $relatedResources;

    /**
     * @var Memo $memo
     */
    #[JsonProperty('memo')]
    public Memo $memo;

    /**
     * @param array{
     *   id: string,
     *   relatedResources: array<(
     *    Account
     *   |Patient
     *   |Practitioner
     *   |Script
     * )>,
     *   memo: Memo,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->relatedResources = $values['relatedResources'];$this->memo = $values['memo'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
