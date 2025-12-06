<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * Represents a client application
 */
class Client extends JsonSerializableType
{
    /**
     * @var string $clientId The unique client identifier
     */
    #[JsonProperty('client_id')]
    public string $clientId;

    /**
     * @var ?string $tenant The tenant name
     */
    #[JsonProperty('tenant')]
    public ?string $tenant;

    /**
     * @var string $name Name of the client
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?string $description Free text description of the client
     */
    #[JsonProperty('description')]
    public ?string $description;

    /**
     * @var ?bool $global Whether this is a global client
     */
    #[JsonProperty('global')]
    public ?bool $global;

    /**
     * @var ?string $clientSecret The client secret (only for non-public clients)
     */
    #[JsonProperty('client_secret')]
    public ?string $clientSecret;

    /**
     * @var ?string $appType The type of application (spa, native, regular_web, non_interactive)
     */
    #[JsonProperty('app_type')]
    public ?string $appType;

    /**
     * @var ?string $logoUri URL of the client logo
     */
    #[JsonProperty('logo_uri')]
    public ?string $logoUri;

    /**
     * @var ?bool $isFirstParty Whether this client is a first party client
     */
    #[JsonProperty('is_first_party')]
    public ?bool $isFirstParty;

    /**
     * @var ?bool $oidcConformant Whether this client conforms to OIDC specifications
     */
    #[JsonProperty('oidc_conformant')]
    public ?bool $oidcConformant;

    /**
     * @var ?array<string> $callbacks Allowed callback URLs
     */
    #[JsonProperty('callbacks'), ArrayType(['string'])]
    public ?array $callbacks;

    /**
     * @var ?array<string> $allowedOrigins Allowed origins for CORS
     */
    #[JsonProperty('allowed_origins'), ArrayType(['string'])]
    public ?array $allowedOrigins;

    /**
     * @var ?array<string> $webOrigins Allowed web origins for CORS
     */
    #[JsonProperty('web_origins'), ArrayType(['string'])]
    public ?array $webOrigins;

    /**
     * @var ?array<string> $grantTypes Allowed grant types
     */
    #[JsonProperty('grant_types'), ArrayType(['string'])]
    public ?array $grantTypes;

    /**
     * @var ?array<string, mixed> $jwtConfiguration JWT configuration for the client
     */
    #[JsonProperty('jwt_configuration'), ArrayType(['string' => 'mixed'])]
    public ?array $jwtConfiguration;

    /**
     * @var ?array<array<string, mixed>> $signingKeys Client signing keys
     */
    #[JsonProperty('signing_keys'), ArrayType([['string' => 'mixed']])]
    public ?array $signingKeys;

    /**
     * @var ?array<string, mixed> $encryptionKey Encryption key
     */
    #[JsonProperty('encryption_key'), ArrayType(['string' => 'mixed'])]
    public ?array $encryptionKey;

    /**
     * @var ?bool $sso Whether SSO is enabled
     */
    #[JsonProperty('sso')]
    public ?bool $sso;

    /**
     * @var ?bool $ssoDisabled Whether SSO is disabled
     */
    #[JsonProperty('sso_disabled')]
    public ?bool $ssoDisabled;

    /**
     * @var ?bool $crossOriginAuth Whether to use cross-origin authentication
     */
    #[JsonProperty('cross_origin_auth')]
    public ?bool $crossOriginAuth;

    /**
     * @var ?string $crossOriginLoc URL for cross-origin authentication
     */
    #[JsonProperty('cross_origin_loc')]
    public ?string $crossOriginLoc;

    /**
     * @var ?bool $customLoginPageOn Whether a custom login page is enabled
     */
    #[JsonProperty('custom_login_page_on')]
    public ?bool $customLoginPageOn;

    /**
     * @var ?string $customLoginPage Custom login page URL
     */
    #[JsonProperty('custom_login_page')]
    public ?string $customLoginPage;

    /**
     * @var ?string $customLoginPagePreview Custom login page preview URL
     */
    #[JsonProperty('custom_login_page_preview')]
    public ?string $customLoginPagePreview;

    /**
     * @var ?string $formTemplate Form template for WS-Federation
     */
    #[JsonProperty('form_template')]
    public ?string $formTemplate;

    /**
     * @var ?bool $isHerokuApp Whether this is a Heroku application
     */
    #[JsonProperty('is_heroku_app')]
    public ?bool $isHerokuApp;

    /**
     * @var ?array<string, mixed> $addons Addons enabled for this client
     */
    #[JsonProperty('addons'), ArrayType(['string' => 'mixed'])]
    public ?array $addons;

    /**
     * @var ?string $tokenEndpointAuthMethod Requested authentication method for the token endpoint
     */
    #[JsonProperty('token_endpoint_auth_method')]
    public ?string $tokenEndpointAuthMethod;

    /**
     * @var ?array<string, mixed> $clientMetadata Metadata associated with the client
     */
    #[JsonProperty('client_metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $clientMetadata;

    /**
     * @var ?array<string, mixed> $mobile Mobile app settings
     */
    #[JsonProperty('mobile'), ArrayType(['string' => 'mixed'])]
    public ?array $mobile;

    /**
     * @param array{
     *   clientId: string,
     *   name: string,
     *   tenant?: ?string,
     *   description?: ?string,
     *   global?: ?bool,
     *   clientSecret?: ?string,
     *   appType?: ?string,
     *   logoUri?: ?string,
     *   isFirstParty?: ?bool,
     *   oidcConformant?: ?bool,
     *   callbacks?: ?array<string>,
     *   allowedOrigins?: ?array<string>,
     *   webOrigins?: ?array<string>,
     *   grantTypes?: ?array<string>,
     *   jwtConfiguration?: ?array<string, mixed>,
     *   signingKeys?: ?array<array<string, mixed>>,
     *   encryptionKey?: ?array<string, mixed>,
     *   sso?: ?bool,
     *   ssoDisabled?: ?bool,
     *   crossOriginAuth?: ?bool,
     *   crossOriginLoc?: ?string,
     *   customLoginPageOn?: ?bool,
     *   customLoginPage?: ?string,
     *   customLoginPagePreview?: ?string,
     *   formTemplate?: ?string,
     *   isHerokuApp?: ?bool,
     *   addons?: ?array<string, mixed>,
     *   tokenEndpointAuthMethod?: ?string,
     *   clientMetadata?: ?array<string, mixed>,
     *   mobile?: ?array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->clientId = $values['clientId'];$this->tenant = $values['tenant'] ?? null;$this->name = $values['name'];$this->description = $values['description'] ?? null;$this->global = $values['global'] ?? null;$this->clientSecret = $values['clientSecret'] ?? null;$this->appType = $values['appType'] ?? null;$this->logoUri = $values['logoUri'] ?? null;$this->isFirstParty = $values['isFirstParty'] ?? null;$this->oidcConformant = $values['oidcConformant'] ?? null;$this->callbacks = $values['callbacks'] ?? null;$this->allowedOrigins = $values['allowedOrigins'] ?? null;$this->webOrigins = $values['webOrigins'] ?? null;$this->grantTypes = $values['grantTypes'] ?? null;$this->jwtConfiguration = $values['jwtConfiguration'] ?? null;$this->signingKeys = $values['signingKeys'] ?? null;$this->encryptionKey = $values['encryptionKey'] ?? null;$this->sso = $values['sso'] ?? null;$this->ssoDisabled = $values['ssoDisabled'] ?? null;$this->crossOriginAuth = $values['crossOriginAuth'] ?? null;$this->crossOriginLoc = $values['crossOriginLoc'] ?? null;$this->customLoginPageOn = $values['customLoginPageOn'] ?? null;$this->customLoginPage = $values['customLoginPage'] ?? null;$this->customLoginPagePreview = $values['customLoginPagePreview'] ?? null;$this->formTemplate = $values['formTemplate'] ?? null;$this->isHerokuApp = $values['isHerokuApp'] ?? null;$this->addons = $values['addons'] ?? null;$this->tokenEndpointAuthMethod = $values['tokenEndpointAuthMethod'] ?? null;$this->clientMetadata = $values['clientMetadata'] ?? null;$this->mobile = $values['mobile'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
