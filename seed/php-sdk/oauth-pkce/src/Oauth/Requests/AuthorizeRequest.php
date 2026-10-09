<?php

namespace Seed\Oauth\Requests;

use Seed\Core\Json\JsonSerializableType;

class AuthorizeRequest extends JsonSerializableType
{
    /**
     * @var 'code' $responseType
     */
    public string $responseType;

    /**
     * @var string $clientId
     */
    public string $clientId;

    /**
     * @var string $redirectUri
     */
    public string $redirectUri;

    /**
     * @var string $codeChallenge
     */
    public string $codeChallenge;

    /**
     * @var ?'S256' $codeChallengeMethod
     */
    public ?string $codeChallengeMethod;

    /**
     * @var ?string $scope
     */
    public ?string $scope;

    /**
     * @var ?string $state
     */
    public ?string $state;

    /**
     * @param array{
     *   responseType: 'code',
     *   clientId: string,
     *   redirectUri: string,
     *   codeChallenge: string,
     *   codeChallengeMethod?: ?'S256',
     *   scope?: ?string,
     *   state?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->responseType = $values['responseType'];
        $this->clientId = $values['clientId'];
        $this->redirectUri = $values['redirectUri'];
        $this->codeChallenge = $values['codeChallenge'];
        $this->codeChallengeMethod = $values['codeChallengeMethod'] ?? null;
        $this->scope = $values['scope'] ?? null;
        $this->state = $values['state'] ?? null;
    }
}
