<?php

namespace Seed\Auth\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetTokenRequest extends JsonSerializableType
{
    /**
     * @var string $cid
     */
    #[JsonProperty('cid')]
    public string $cid;

    /**
     * @var string $csr
     */
    #[JsonProperty('csr')]
    public string $csr;

    /**
     * @var string $scp
     */
    #[JsonProperty('scp')]
    public string $scp;

    /**
     * @var string $entityId
     */
    #[JsonProperty('entity_id')]
    public string $entityId;

    /**
     * @var string $audience
     */
    #[JsonProperty('audience')]
    public string $audience;

    /**
     * @var string $grantType
     */
    #[JsonProperty('grant_type')]
    public string $grantType;

    /**
     * @var ?string $scope
     */
    #[JsonProperty('scope')]
    public ?string $scope;

    /**
     * @param array{
     *   cid: string,
     *   csr: string,
     *   scp: string,
     *   entityId: string,
     *   audience: string,
     *   grantType: string,
     *   scope?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->cid = $values['cid'];
        $this->csr = $values['csr'];
        $this->scp = $values['scp'];
        $this->entityId = $values['entityId'];
        $this->audience = $values['audience'];
        $this->grantType = $values['grantType'];
        $this->scope = $values['scope'] ?? null;
    }
}
