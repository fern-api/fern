<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;
use Seed\Types\Account;
use Seed\Types\Patient;
use Seed\Types\Practitioner;
use Seed\Types\Script;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;
use Seed\Types\Memo;

trait BaseResource
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var array<Account|Patient|Practitioner|Script> $relatedResources
     */
    #[JsonProperty('related_resources'), ArrayType([new Union(Account::class, Patient::class, Practitioner::class, Script::class)])]
    public array $relatedResources;

    /**
     * @var Memo $memo
     */
    #[JsonProperty('memo')]
    public Memo $memo;
}
