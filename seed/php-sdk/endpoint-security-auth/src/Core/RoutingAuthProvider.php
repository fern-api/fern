<?php

namespace Seed\Core;

/**
 * Routes authentication per-endpoint. Given an endpoint's declared security
 * requirements, it applies the headers for the first requirement whose schemes
 * all have credentials available.
 */
class RoutingAuthProvider
{
    /**
     * @var ?string $token
     */
    private ?string $token;

    /**
     * @var ?string $apiKey
     */
    private ?string $apiKey;

    /**
     * @var ?OAuthTokenProvider $oauthTokenProvider
     */
    private ?OAuthTokenProvider $oauthTokenProvider;

    /**
     * @var ?string $username
     */
    private ?string $username;

    /**
     * @var ?string $password
     */
    private ?string $password;

    /**
     * @var ?InferredAuthProvider $inferredAuthProvider
     */
    private ?InferredAuthProvider $inferredAuthProvider;

    /**
     * @param ?string $token
     * @param ?string $apiKey
     * @param ?OAuthTokenProvider $oauthTokenProvider
     * @param ?string $username
     * @param ?string $password
     * @param ?InferredAuthProvider $inferredAuthProvider
     */
    public function __construct(
        ?string $token = null,
        ?string $apiKey = null,
        ?OAuthTokenProvider $oauthTokenProvider = null,
        ?string $username = null,
        ?string $password = null,
        ?InferredAuthProvider $inferredAuthProvider = null,
    ) {
        $this->token = $token;
        $this->apiKey = $apiKey;
        $this->oauthTokenProvider = $oauthTokenProvider;
        $this->username = $username;
        $this->password = $password;
        $this->inferredAuthProvider = $inferredAuthProvider;
    }

    /**
     * Returns the auth headers for the first satisfiable security requirement.
     *
     * @param ?array<array<string, array<string>>> $security The endpoint's security requirements (an OR-list of AND-maps of scheme keys to scopes).
     * @return array<string, string>
     */
    public function getAuthHeaders(?array $security = null): array
    {
        if ($security === null || count($security) === 0) {
            return [];
        }

        /** @var array<string, callable(): array<string, string>> $available */
        $available = [];
        $token = $this->token;
        if ($token !== null) {
            $available['Bearer'] = fn (): array => ['Authorization' => "Bearer {$token}"];
        }
        $apiKey = $this->apiKey;
        if ($apiKey !== null) {
            $available['ApiKey'] = fn (): array => ['X-API-Key' => $apiKey];
        }
        $oauthTokenProvider = $this->oauthTokenProvider;
        if ($oauthTokenProvider !== null) {
            $available['OAuth'] = fn (): array => ['Authorization' => "Bearer " . $oauthTokenProvider->getToken()];
        }
        $username = $this->username;
        $password = $this->password;
        if ($username !== null && $password !== null) {
            $available['Basic'] = fn (): array => ['Authorization' => "Basic " . base64_encode("{$username}:{$password}")];
        }
        $inferredAuthProvider = $this->inferredAuthProvider;
        if ($inferredAuthProvider !== null) {
            $available['InferredAuth'] = fn (): array => $inferredAuthProvider->getAuthHeaders();
        }

        foreach ($security as $requirement) {
            $schemeKeys = array_keys($requirement);
            $satisfiable = true;
            foreach ($schemeKeys as $schemeKey) {
                if (!isset($available[$schemeKey])) {
                    $satisfiable = false;
                    break;
                }
            }
            if ($satisfiable) {
                $headers = [];
                foreach ($schemeKeys as $schemeKey) {
                    $headers = array_merge($headers, $available[$schemeKey]());
                }
                return $headers;
            }
        }

        $requirementHints = [];
        foreach ($security as $requirement) {
            $missing = [];
            foreach (array_keys($requirement) as $schemeKey) {
                if (!isset($available[$schemeKey])) {
                    $missing[] = $schemeKey;
                }
            }
            $requirementHints[] = implode(' AND ', $missing);
        }
        throw new \Exception(
            "No authentication credentials provided that satisfy the endpoint's security requirements. "
            . "Please provide credentials for: " . implode(' OR ', $requirementHints)
        );
    }
}
