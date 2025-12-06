<?php

namespace Seed\Traits;

use Seed\Account;
use Seed\Patient;
use Seed\Practitioner;
use Seed\Script;
use Seed\Memo;
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
