import Foundation

/// Represents a client application
public struct Client: Codable, Hashable, Sendable {
    /// The unique client identifier
    public let clientId: String
    /// The tenant name
    public let tenant: Nullable<String>?
    /// Name of the client
    public let name: String
    /// Free text description of the client
    public let description: Nullable<String>?
    /// Whether this is a global client
    public let global: Nullable<Bool>?
    /// The client secret (only for non-public clients)
    public let clientSecret: Nullable<String>?
    /// The type of application (spa, native, regular_web, non_interactive)
    public let appType: Nullable<String>?
    /// URL of the client logo
    public let logoUri: Nullable<String>?
    /// Whether this client is a first party client
    public let isFirstParty: Nullable<Bool>?
    /// Whether this client conforms to OIDC specifications
    public let oidcConformant: Nullable<Bool>?
    /// Allowed callback URLs
    public let callbacks: Nullable<[String]>?
    /// Allowed origins for CORS
    public let allowedOrigins: Nullable<[String]>?
    /// Allowed web origins for CORS
    public let webOrigins: Nullable<[String]>?
    /// Allowed grant types
    public let grantTypes: Nullable<[String]>?
    /// JWT configuration for the client
    public let jwtConfiguration: Nullable<[String: JSONValue]>?
    /// Client signing keys
    public let signingKeys: Nullable<[[String: JSONValue]]>?
    /// Encryption key
    public let encryptionKey: Nullable<[String: JSONValue]>?
    /// Whether SSO is enabled
    public let sso: Nullable<Bool>?
    /// Whether SSO is disabled
    public let ssoDisabled: Nullable<Bool>?
    /// Whether to use cross-origin authentication
    public let crossOriginAuth: Nullable<Bool>?
    /// URL for cross-origin authentication
    public let crossOriginLoc: Nullable<String>?
    /// Whether a custom login page is enabled
    public let customLoginPageOn: Nullable<Bool>?
    /// Custom login page URL
    public let customLoginPage: Nullable<String>?
    /// Custom login page preview URL
    public let customLoginPagePreview: Nullable<String>?
    /// Form template for WS-Federation
    public let formTemplate: Nullable<String>?
    /// Whether this is a Heroku application
    public let isHerokuApp: Nullable<Bool>?
    /// Addons enabled for this client
    public let addons: Nullable<[String: JSONValue]>?
    /// Requested authentication method for the token endpoint
    public let tokenEndpointAuthMethod: Nullable<String>?
    /// Metadata associated with the client
    public let clientMetadata: Nullable<[String: JSONValue]>?
    /// Mobile app settings
    public let mobile: Nullable<[String: JSONValue]>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        clientId: String,
        tenant: Nullable<String>? = nil,
        name: String,
        description: Nullable<String>? = nil,
        global: Nullable<Bool>? = nil,
        clientSecret: Nullable<String>? = nil,
        appType: Nullable<String>? = nil,
        logoUri: Nullable<String>? = nil,
        isFirstParty: Nullable<Bool>? = nil,
        oidcConformant: Nullable<Bool>? = nil,
        callbacks: Nullable<[String]>? = nil,
        allowedOrigins: Nullable<[String]>? = nil,
        webOrigins: Nullable<[String]>? = nil,
        grantTypes: Nullable<[String]>? = nil,
        jwtConfiguration: Nullable<[String: JSONValue]>? = nil,
        signingKeys: Nullable<[[String: JSONValue]]>? = nil,
        encryptionKey: Nullable<[String: JSONValue]>? = nil,
        sso: Nullable<Bool>? = nil,
        ssoDisabled: Nullable<Bool>? = nil,
        crossOriginAuth: Nullable<Bool>? = nil,
        crossOriginLoc: Nullable<String>? = nil,
        customLoginPageOn: Nullable<Bool>? = nil,
        customLoginPage: Nullable<String>? = nil,
        customLoginPagePreview: Nullable<String>? = nil,
        formTemplate: Nullable<String>? = nil,
        isHerokuApp: Nullable<Bool>? = nil,
        addons: Nullable<[String: JSONValue]>? = nil,
        tokenEndpointAuthMethod: Nullable<String>? = nil,
        clientMetadata: Nullable<[String: JSONValue]>? = nil,
        mobile: Nullable<[String: JSONValue]>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.clientId = clientId
        self.tenant = tenant
        self.name = name
        self.description = description
        self.global = global
        self.clientSecret = clientSecret
        self.appType = appType
        self.logoUri = logoUri
        self.isFirstParty = isFirstParty
        self.oidcConformant = oidcConformant
        self.callbacks = callbacks
        self.allowedOrigins = allowedOrigins
        self.webOrigins = webOrigins
        self.grantTypes = grantTypes
        self.jwtConfiguration = jwtConfiguration
        self.signingKeys = signingKeys
        self.encryptionKey = encryptionKey
        self.sso = sso
        self.ssoDisabled = ssoDisabled
        self.crossOriginAuth = crossOriginAuth
        self.crossOriginLoc = crossOriginLoc
        self.customLoginPageOn = customLoginPageOn
        self.customLoginPage = customLoginPage
        self.customLoginPagePreview = customLoginPagePreview
        self.formTemplate = formTemplate
        self.isHerokuApp = isHerokuApp
        self.addons = addons
        self.tokenEndpointAuthMethod = tokenEndpointAuthMethod
        self.clientMetadata = clientMetadata
        self.mobile = mobile
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.clientId = try container.decode(String.self, forKey: .clientId)
        self.tenant = try container.decodeNullableIfPresent(String.self, forKey: .tenant)
        self.name = try container.decode(String.self, forKey: .name)
        self.description = try container.decodeNullableIfPresent(String.self, forKey: .description)
        self.global = try container.decodeNullableIfPresent(Bool.self, forKey: .global)
        self.clientSecret = try container.decodeNullableIfPresent(String.self, forKey: .clientSecret)
        self.appType = try container.decodeNullableIfPresent(String.self, forKey: .appType)
        self.logoUri = try container.decodeNullableIfPresent(String.self, forKey: .logoUri)
        self.isFirstParty = try container.decodeNullableIfPresent(Bool.self, forKey: .isFirstParty)
        self.oidcConformant = try container.decodeNullableIfPresent(Bool.self, forKey: .oidcConformant)
        self.callbacks = try container.decodeNullableIfPresent([String].self, forKey: .callbacks)
        self.allowedOrigins = try container.decodeNullableIfPresent([String].self, forKey: .allowedOrigins)
        self.webOrigins = try container.decodeNullableIfPresent([String].self, forKey: .webOrigins)
        self.grantTypes = try container.decodeNullableIfPresent([String].self, forKey: .grantTypes)
        self.jwtConfiguration = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .jwtConfiguration)
        self.signingKeys = try container.decodeNullableIfPresent([[String: JSONValue]].self, forKey: .signingKeys)
        self.encryptionKey = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .encryptionKey)
        self.sso = try container.decodeNullableIfPresent(Bool.self, forKey: .sso)
        self.ssoDisabled = try container.decodeNullableIfPresent(Bool.self, forKey: .ssoDisabled)
        self.crossOriginAuth = try container.decodeNullableIfPresent(Bool.self, forKey: .crossOriginAuth)
        self.crossOriginLoc = try container.decodeNullableIfPresent(String.self, forKey: .crossOriginLoc)
        self.customLoginPageOn = try container.decodeNullableIfPresent(Bool.self, forKey: .customLoginPageOn)
        self.customLoginPage = try container.decodeNullableIfPresent(String.self, forKey: .customLoginPage)
        self.customLoginPagePreview = try container.decodeNullableIfPresent(String.self, forKey: .customLoginPagePreview)
        self.formTemplate = try container.decodeNullableIfPresent(String.self, forKey: .formTemplate)
        self.isHerokuApp = try container.decodeNullableIfPresent(Bool.self, forKey: .isHerokuApp)
        self.addons = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .addons)
        self.tokenEndpointAuthMethod = try container.decodeNullableIfPresent(String.self, forKey: .tokenEndpointAuthMethod)
        self.clientMetadata = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .clientMetadata)
        self.mobile = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .mobile)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.clientId, forKey: .clientId)
        try container.encodeNullableIfPresent(self.tenant, forKey: .tenant)
        try container.encode(self.name, forKey: .name)
        try container.encodeNullableIfPresent(self.description, forKey: .description)
        try container.encodeNullableIfPresent(self.global, forKey: .global)
        try container.encodeNullableIfPresent(self.clientSecret, forKey: .clientSecret)
        try container.encodeNullableIfPresent(self.appType, forKey: .appType)
        try container.encodeNullableIfPresent(self.logoUri, forKey: .logoUri)
        try container.encodeNullableIfPresent(self.isFirstParty, forKey: .isFirstParty)
        try container.encodeNullableIfPresent(self.oidcConformant, forKey: .oidcConformant)
        try container.encodeNullableIfPresent(self.callbacks, forKey: .callbacks)
        try container.encodeNullableIfPresent(self.allowedOrigins, forKey: .allowedOrigins)
        try container.encodeNullableIfPresent(self.webOrigins, forKey: .webOrigins)
        try container.encodeNullableIfPresent(self.grantTypes, forKey: .grantTypes)
        try container.encodeNullableIfPresent(self.jwtConfiguration, forKey: .jwtConfiguration)
        try container.encodeNullableIfPresent(self.signingKeys, forKey: .signingKeys)
        try container.encodeNullableIfPresent(self.encryptionKey, forKey: .encryptionKey)
        try container.encodeNullableIfPresent(self.sso, forKey: .sso)
        try container.encodeNullableIfPresent(self.ssoDisabled, forKey: .ssoDisabled)
        try container.encodeNullableIfPresent(self.crossOriginAuth, forKey: .crossOriginAuth)
        try container.encodeNullableIfPresent(self.crossOriginLoc, forKey: .crossOriginLoc)
        try container.encodeNullableIfPresent(self.customLoginPageOn, forKey: .customLoginPageOn)
        try container.encodeNullableIfPresent(self.customLoginPage, forKey: .customLoginPage)
        try container.encodeNullableIfPresent(self.customLoginPagePreview, forKey: .customLoginPagePreview)
        try container.encodeNullableIfPresent(self.formTemplate, forKey: .formTemplate)
        try container.encodeNullableIfPresent(self.isHerokuApp, forKey: .isHerokuApp)
        try container.encodeNullableIfPresent(self.addons, forKey: .addons)
        try container.encodeNullableIfPresent(self.tokenEndpointAuthMethod, forKey: .tokenEndpointAuthMethod)
        try container.encodeNullableIfPresent(self.clientMetadata, forKey: .clientMetadata)
        try container.encodeNullableIfPresent(self.mobile, forKey: .mobile)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case clientId = "client_id"
        case tenant
        case name
        case description
        case global
        case clientSecret = "client_secret"
        case appType = "app_type"
        case logoUri = "logo_uri"
        case isFirstParty = "is_first_party"
        case oidcConformant = "oidc_conformant"
        case callbacks
        case allowedOrigins = "allowed_origins"
        case webOrigins = "web_origins"
        case grantTypes = "grant_types"
        case jwtConfiguration = "jwt_configuration"
        case signingKeys = "signing_keys"
        case encryptionKey = "encryption_key"
        case sso
        case ssoDisabled = "sso_disabled"
        case crossOriginAuth = "cross_origin_auth"
        case crossOriginLoc = "cross_origin_loc"
        case customLoginPageOn = "custom_login_page_on"
        case customLoginPage = "custom_login_page"
        case customLoginPagePreview = "custom_login_page_preview"
        case formTemplate = "form_template"
        case isHerokuApp = "is_heroku_app"
        case addons
        case tokenEndpointAuthMethod = "token_endpoint_auth_method"
        case clientMetadata = "client_metadata"
        case mobile
    }
}