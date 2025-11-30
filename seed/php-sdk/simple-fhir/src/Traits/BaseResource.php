<?php

namespace Seed\Traits;

use Seed\Types\Account;
use Seed\Types\Patient;
use Seed\Types\Practitioner;
use Seed\Types\Script;
use Seed\Types\Memo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

/**
 * @property string $id
 * @property array<(
 *    Account
 *   |Patient
 *   |Practitioner
 *   |Script
 * )> $relatedResources
 * @property Memo $memo
 */
trait BaseResource 
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
}
