import Foundation

/// Represents a client application
public struct Client: Codable, Hashable, Sendable {
    /// The unique client identifier
    public let clientId: String
    /// The tenant name
    public let tenant: String?
    /// Name of the client
    public let name: String
    /// Free text description of the client
    public let description: String?
    /// Whether this is a global client
    public let global: Bool?
    /// The client secret (only for non-public clients)
    public let clientSecret: String?
    /// The type of application (spa, native, regular_web, non_interactive)
    public let appType: String?
    /// URL of the client logo
    public let logoUri: String?
    /// Whether this client is a first party client
    public let isFirstParty: Bool?
    /// Whether this client conforms to OIDC specifications
    public let oidcConformant: Bool?
    /// Allowed callback URLs
    public let callbacks: [String]?
    /// Allowed origins for CORS
    public let allowedOrigins: [String]?
    /// Allowed web origins for CORS
    public let webOrigins: [String]?
    /// Allowed grant types
    public let grantTypes: [String]?
    /// JWT configuration for the client
    public let jwtConfiguration: [String: JSONValue]?
    /// Client signing keys
    public let signingKeys: [[String: JSONValue]]?
    /// Encryption key
    public let encryptionKey: [String: JSONValue]?
    /// Whether SSO is enabled
    public let sso: Bool?
    /// Whether SSO is disabled
    public let ssoDisabled: Bool?
    /// Whether to use cross-origin authentication
    public let crossOriginAuth: Bool?
    /// URL for cross-origin authentication
    public let crossOriginLoc: String?
    /// Whether a custom login page is enabled
    public let customLoginPageOn: Bool?
    /// Custom login page URL
    public let customLoginPage: String?
    /// Custom login page preview URL
    public let customLoginPagePreview: String?
    /// Form template for WS-Federation
    public let formTemplate: String?
    /// Whether this is a Heroku application
    public let isHerokuApp: Bool?
    /// Addons enabled for this client
    public let addons: [String: JSONValue]?
    /// Requested authentication method for the token endpoint
    public let tokenEndpointAuthMethod: String?
    /// Metadata associated with the client
    public let clientMetadata: [String: JSONValue]?
    /// Mobile app settings
    public let mobile: [String: JSONValue]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        clientId: String,
        tenant: String? = nil,
        name: String,
        description: String? = nil,
        global: Bool? = nil,
        clientSecret: String? = nil,
        appType: String? = nil,
        logoUri: String? = nil,
        isFirstParty: Bool? = nil,
        oidcConformant: Bool? = nil,
        callbacks: [String]? = nil,
        allowedOrigins: [String]? = nil,
        webOrigins: [String]? = nil,
        grantTypes: [String]? = nil,
        jwtConfiguration: [String: JSONValue]? = nil,
        signingKeys: [[String: JSONValue]]? = nil,
        encryptionKey: [String: JSONValue]? = nil,
        sso: Bool? = nil,
        ssoDisabled: Bool? = nil,
        crossOriginAuth: Bool? = nil,
        crossOriginLoc: String? = nil,
        customLoginPageOn: Bool? = nil,
        customLoginPage: String? = nil,
        customLoginPagePreview: String? = nil,
        formTemplate: String? = nil,
        isHerokuApp: Bool? = nil,
        addons: [String: JSONValue]? = nil,
        tokenEndpointAuthMethod: String? = nil,
        clientMetadata: [String: JSONValue]? = nil,
        mobile: [String: JSONValue]? = nil,
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
        self.tenant = try container.decodeIfPresent(String.self, forKey: .tenant)
        self.name = try container.decode(String.self, forKey: .name)
        self.description = try container.decodeIfPresent(String.self, forKey: .description)
        self.global = try container.decodeIfPresent(Bool.self, forKey: .global)
        self.clientSecret = try container.decodeIfPresent(String.self, forKey: .clientSecret)
        self.appType = try container.decodeIfPresent(String.self, forKey: .appType)
        self.logoUri = try container.decodeIfPresent(String.self, forKey: .logoUri)
        self.isFirstParty = try container.decodeIfPresent(Bool.self, forKey: .isFirstParty)
        self.oidcConformant = try container.decodeIfPresent(Bool.self, forKey: .oidcConformant)
        self.callbacks = try container.decodeIfPresent([String].self, forKey: .callbacks)
        self.allowedOrigins = try container.decodeIfPresent([String].self, forKey: .allowedOrigins)
        self.webOrigins = try container.decodeIfPresent([String].self, forKey: .webOrigins)
        self.grantTypes = try container.decodeIfPresent([String].self, forKey: .grantTypes)
        self.jwtConfiguration = try container.decodeIfPresent([String: JSONValue].self, forKey: .jwtConfiguration)
        self.signingKeys = try container.decodeIfPresent([[String: JSONValue]].self, forKey: .signingKeys)
        self.encryptionKey = try container.decodeIfPresent([String: JSONValue].self, forKey: .encryptionKey)
        self.sso = try container.decodeIfPresent(Bool.self, forKey: .sso)
        self.ssoDisabled = try container.decodeIfPresent(Bool.self, forKey: .ssoDisabled)
        self.crossOriginAuth = try container.decodeIfPresent(Bool.self, forKey: .crossOriginAuth)
        self.crossOriginLoc = try container.decodeIfPresent(String.self, forKey: .crossOriginLoc)
        self.customLoginPageOn = try container.decodeIfPresent(Bool.self, forKey: .customLoginPageOn)
        self.customLoginPage = try container.decodeIfPresent(String.self, forKey: .customLoginPage)
        self.customLoginPagePreview = try container.decodeIfPresent(String.self, forKey: .customLoginPagePreview)
        self.formTemplate = try container.decodeIfPresent(String.self, forKey: .formTemplate)
        self.isHerokuApp = try container.decodeIfPresent(Bool.self, forKey: .isHerokuApp)
        self.addons = try container.decodeIfPresent([String: JSONValue].self, forKey: .addons)
        self.tokenEndpointAuthMethod = try container.decodeIfPresent(String.self, forKey: .tokenEndpointAuthMethod)
        self.clientMetadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .clientMetadata)
        self.mobile = try container.decodeIfPresent([String: JSONValue].self, forKey: .mobile)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.clientId, forKey: .clientId)
        try container.encodeIfPresent(self.tenant, forKey: .tenant)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.description, forKey: .description)
        try container.encodeIfPresent(self.global, forKey: .global)
        try container.encodeIfPresent(self.clientSecret, forKey: .clientSecret)
        try container.encodeIfPresent(self.appType, forKey: .appType)
        try container.encodeIfPresent(self.logoUri, forKey: .logoUri)
        try container.encodeIfPresent(self.isFirstParty, forKey: .isFirstParty)
        try container.encodeIfPresent(self.oidcConformant, forKey: .oidcConformant)
        try container.encodeIfPresent(self.callbacks, forKey: .callbacks)
        try container.encodeIfPresent(self.allowedOrigins, forKey: .allowedOrigins)
        try container.encodeIfPresent(self.webOrigins, forKey: .webOrigins)
        try container.encodeIfPresent(self.grantTypes, forKey: .grantTypes)
        try container.encodeIfPresent(self.jwtConfiguration, forKey: .jwtConfiguration)
        try container.encodeIfPresent(self.signingKeys, forKey: .signingKeys)
        try container.encodeIfPresent(self.encryptionKey, forKey: .encryptionKey)
        try container.encodeIfPresent(self.sso, forKey: .sso)
        try container.encodeIfPresent(self.ssoDisabled, forKey: .ssoDisabled)
        try container.encodeIfPresent(self.crossOriginAuth, forKey: .crossOriginAuth)
        try container.encodeIfPresent(self.crossOriginLoc, forKey: .crossOriginLoc)
        try container.encodeIfPresent(self.customLoginPageOn, forKey: .customLoginPageOn)
        try container.encodeIfPresent(self.customLoginPage, forKey: .customLoginPage)
        try container.encodeIfPresent(self.customLoginPagePreview, forKey: .customLoginPagePreview)
        try container.encodeIfPresent(self.formTemplate, forKey: .formTemplate)
        try container.encodeIfPresent(self.isHerokuApp, forKey: .isHerokuApp)
        try container.encodeIfPresent(self.addons, forKey: .addons)
        try container.encodeIfPresent(self.tokenEndpointAuthMethod, forKey: .tokenEndpointAuthMethod)
        try container.encodeIfPresent(self.clientMetadata, forKey: .clientMetadata)
        try container.encodeIfPresent(self.mobile, forKey: .mobile)
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