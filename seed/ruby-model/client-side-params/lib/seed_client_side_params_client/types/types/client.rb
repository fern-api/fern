# frozen_string_literal: true

require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    # Represents a client application
    class Client
      # @return [String] The unique client identifier
      attr_reader :client_id
      # @return [String] The tenant name
      attr_reader :tenant
      # @return [String] Name of the client
      attr_reader :name
      # @return [String] Free text description of the client
      attr_reader :description
      # @return [Boolean] Whether this is a global client
      attr_reader :global
      # @return [String] The client secret (only for non-public clients)
      attr_reader :client_secret
      # @return [String] The type of application (spa, native, regular_web, non_interactive)
      attr_reader :app_type
      # @return [String] URL of the client logo
      attr_reader :logo_uri
      # @return [Boolean] Whether this client is a first party client
      attr_reader :is_first_party
      # @return [Boolean] Whether this client conforms to OIDC specifications
      attr_reader :oidc_conformant
      # @return [Array<String>] Allowed callback URLs
      attr_reader :callbacks
      # @return [Array<String>] Allowed origins for CORS
      attr_reader :allowed_origins
      # @return [Array<String>] Allowed web origins for CORS
      attr_reader :web_origins
      # @return [Array<String>] Allowed grant types
      attr_reader :grant_types
      # @return [Hash{String => Object}] JWT configuration for the client
      attr_reader :jwt_configuration
      # @return [Array<Hash{String => Object}>] Client signing keys
      attr_reader :signing_keys
      # @return [Hash{String => Object}] Encryption key
      attr_reader :encryption_key
      # @return [Boolean] Whether SSO is enabled
      attr_reader :sso
      # @return [Boolean] Whether SSO is disabled
      attr_reader :sso_disabled
      # @return [Boolean] Whether to use cross-origin authentication
      attr_reader :cross_origin_auth
      # @return [String] URL for cross-origin authentication
      attr_reader :cross_origin_loc
      # @return [Boolean] Whether a custom login page is enabled
      attr_reader :custom_login_page_on
      # @return [String] Custom login page URL
      attr_reader :custom_login_page
      # @return [String] Custom login page preview URL
      attr_reader :custom_login_page_preview
      # @return [String] Form template for WS-Federation
      attr_reader :form_template
      # @return [Boolean] Whether this is a Heroku application
      attr_reader :is_heroku_app
      # @return [Hash{String => Object}] Addons enabled for this client
      attr_reader :addons
      # @return [String] Requested authentication method for the token endpoint
      attr_reader :token_endpoint_auth_method
      # @return [Hash{String => Object}] Metadata associated with the client
      attr_reader :client_metadata
      # @return [Hash{String => Object}] Mobile app settings
      attr_reader :mobile
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param client_id [String] The unique client identifier
      # @param tenant [String] The tenant name
      # @param name [String] Name of the client
      # @param description [String] Free text description of the client
      # @param global [Boolean] Whether this is a global client
      # @param client_secret [String] The client secret (only for non-public clients)
      # @param app_type [String] The type of application (spa, native, regular_web, non_interactive)
      # @param logo_uri [String] URL of the client logo
      # @param is_first_party [Boolean] Whether this client is a first party client
      # @param oidc_conformant [Boolean] Whether this client conforms to OIDC specifications
      # @param callbacks [Array<String>] Allowed callback URLs
      # @param allowed_origins [Array<String>] Allowed origins for CORS
      # @param web_origins [Array<String>] Allowed web origins for CORS
      # @param grant_types [Array<String>] Allowed grant types
      # @param jwt_configuration [Hash{String => Object}] JWT configuration for the client
      # @param signing_keys [Array<Hash{String => Object}>] Client signing keys
      # @param encryption_key [Hash{String => Object}] Encryption key
      # @param sso [Boolean] Whether SSO is enabled
      # @param sso_disabled [Boolean] Whether SSO is disabled
      # @param cross_origin_auth [Boolean] Whether to use cross-origin authentication
      # @param cross_origin_loc [String] URL for cross-origin authentication
      # @param custom_login_page_on [Boolean] Whether a custom login page is enabled
      # @param custom_login_page [String] Custom login page URL
      # @param custom_login_page_preview [String] Custom login page preview URL
      # @param form_template [String] Form template for WS-Federation
      # @param is_heroku_app [Boolean] Whether this is a Heroku application
      # @param addons [Hash{String => Object}] Addons enabled for this client
      # @param token_endpoint_auth_method [String] Requested authentication method for the token endpoint
      # @param client_metadata [Hash{String => Object}] Metadata associated with the client
      # @param mobile [Hash{String => Object}] Mobile app settings
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::Client]
      def initialize(client_id:, name:, tenant: OMIT, description: OMIT, global: OMIT, client_secret: OMIT,
                     app_type: OMIT, logo_uri: OMIT, is_first_party: OMIT, oidc_conformant: OMIT, callbacks: OMIT, allowed_origins: OMIT, web_origins: OMIT, grant_types: OMIT, jwt_configuration: OMIT, signing_keys: OMIT, encryption_key: OMIT, sso: OMIT, sso_disabled: OMIT, cross_origin_auth: OMIT, cross_origin_loc: OMIT, custom_login_page_on: OMIT, custom_login_page: OMIT, custom_login_page_preview: OMIT, form_template: OMIT, is_heroku_app: OMIT, addons: OMIT, token_endpoint_auth_method: OMIT, client_metadata: OMIT, mobile: OMIT, additional_properties: nil)
        @client_id = client_id
        @tenant = tenant if tenant != OMIT
        @name = name
        @description = description if description != OMIT
        @global = global if global != OMIT
        @client_secret = client_secret if client_secret != OMIT
        @app_type = app_type if app_type != OMIT
        @logo_uri = logo_uri if logo_uri != OMIT
        @is_first_party = is_first_party if is_first_party != OMIT
        @oidc_conformant = oidc_conformant if oidc_conformant != OMIT
        @callbacks = callbacks if callbacks != OMIT
        @allowed_origins = allowed_origins if allowed_origins != OMIT
        @web_origins = web_origins if web_origins != OMIT
        @grant_types = grant_types if grant_types != OMIT
        @jwt_configuration = jwt_configuration if jwt_configuration != OMIT
        @signing_keys = signing_keys if signing_keys != OMIT
        @encryption_key = encryption_key if encryption_key != OMIT
        @sso = sso if sso != OMIT
        @sso_disabled = sso_disabled if sso_disabled != OMIT
        @cross_origin_auth = cross_origin_auth if cross_origin_auth != OMIT
        @cross_origin_loc = cross_origin_loc if cross_origin_loc != OMIT
        @custom_login_page_on = custom_login_page_on if custom_login_page_on != OMIT
        @custom_login_page = custom_login_page if custom_login_page != OMIT
        @custom_login_page_preview = custom_login_page_preview if custom_login_page_preview != OMIT
        @form_template = form_template if form_template != OMIT
        @is_heroku_app = is_heroku_app if is_heroku_app != OMIT
        @addons = addons if addons != OMIT
        @token_endpoint_auth_method = token_endpoint_auth_method if token_endpoint_auth_method != OMIT
        @client_metadata = client_metadata if client_metadata != OMIT
        @mobile = mobile if mobile != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "client_id": client_id,
          "tenant": tenant,
          "name": name,
          "description": description,
          "global": global,
          "client_secret": client_secret,
          "app_type": app_type,
          "logo_uri": logo_uri,
          "is_first_party": is_first_party,
          "oidc_conformant": oidc_conformant,
          "callbacks": callbacks,
          "allowed_origins": allowed_origins,
          "web_origins": web_origins,
          "grant_types": grant_types,
          "jwt_configuration": jwt_configuration,
          "signing_keys": signing_keys,
          "encryption_key": encryption_key,
          "sso": sso,
          "sso_disabled": sso_disabled,
          "cross_origin_auth": cross_origin_auth,
          "cross_origin_loc": cross_origin_loc,
          "custom_login_page_on": custom_login_page_on,
          "custom_login_page": custom_login_page,
          "custom_login_page_preview": custom_login_page_preview,
          "form_template": form_template,
          "is_heroku_app": is_heroku_app,
          "addons": addons,
          "token_endpoint_auth_method": token_endpoint_auth_method,
          "client_metadata": client_metadata,
          "mobile": mobile
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Client
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::Client]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        client_id = parsed_json["client_id"]
        tenant = parsed_json["tenant"]
        name = parsed_json["name"]
        description = parsed_json["description"]
        global = parsed_json["global"]
        client_secret = parsed_json["client_secret"]
        app_type = parsed_json["app_type"]
        logo_uri = parsed_json["logo_uri"]
        is_first_party = parsed_json["is_first_party"]
        oidc_conformant = parsed_json["oidc_conformant"]
        callbacks = parsed_json["callbacks"]
        allowed_origins = parsed_json["allowed_origins"]
        web_origins = parsed_json["web_origins"]
        grant_types = parsed_json["grant_types"]
        jwt_configuration = parsed_json["jwt_configuration"]
        signing_keys = parsed_json["signing_keys"]
        encryption_key = parsed_json["encryption_key"]
        sso = parsed_json["sso"]
        sso_disabled = parsed_json["sso_disabled"]
        cross_origin_auth = parsed_json["cross_origin_auth"]
        cross_origin_loc = parsed_json["cross_origin_loc"]
        custom_login_page_on = parsed_json["custom_login_page_on"]
        custom_login_page = parsed_json["custom_login_page"]
        custom_login_page_preview = parsed_json["custom_login_page_preview"]
        form_template = parsed_json["form_template"]
        is_heroku_app = parsed_json["is_heroku_app"]
        addons = parsed_json["addons"]
        token_endpoint_auth_method = parsed_json["token_endpoint_auth_method"]
        client_metadata = parsed_json["client_metadata"]
        mobile = parsed_json["mobile"]
        new(
          client_id: client_id,
          tenant: tenant,
          name: name,
          description: description,
          global: global,
          client_secret: client_secret,
          app_type: app_type,
          logo_uri: logo_uri,
          is_first_party: is_first_party,
          oidc_conformant: oidc_conformant,
          callbacks: callbacks,
          allowed_origins: allowed_origins,
          web_origins: web_origins,
          grant_types: grant_types,
          jwt_configuration: jwt_configuration,
          signing_keys: signing_keys,
          encryption_key: encryption_key,
          sso: sso,
          sso_disabled: sso_disabled,
          cross_origin_auth: cross_origin_auth,
          cross_origin_loc: cross_origin_loc,
          custom_login_page_on: custom_login_page_on,
          custom_login_page: custom_login_page,
          custom_login_page_preview: custom_login_page_preview,
          form_template: form_template,
          is_heroku_app: is_heroku_app,
          addons: addons,
          token_endpoint_auth_method: token_endpoint_auth_method,
          client_metadata: client_metadata,
          mobile: mobile,
          additional_properties: struct
        )
      end

      # Serialize an instance of Client to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.client_id.is_a?(String) != false || raise("Passed value for field obj.client_id is not the expected type, validation failed.")
        obj.tenant&.is_a?(String) != false || raise("Passed value for field obj.tenant is not the expected type, validation failed.")
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.description&.is_a?(String) != false || raise("Passed value for field obj.description is not the expected type, validation failed.")
        obj.global&.is_a?(Boolean) != false || raise("Passed value for field obj.global is not the expected type, validation failed.")
        obj.client_secret&.is_a?(String) != false || raise("Passed value for field obj.client_secret is not the expected type, validation failed.")
        obj.app_type&.is_a?(String) != false || raise("Passed value for field obj.app_type is not the expected type, validation failed.")
        obj.logo_uri&.is_a?(String) != false || raise("Passed value for field obj.logo_uri is not the expected type, validation failed.")
        obj.is_first_party&.is_a?(Boolean) != false || raise("Passed value for field obj.is_first_party is not the expected type, validation failed.")
        obj.oidc_conformant&.is_a?(Boolean) != false || raise("Passed value for field obj.oidc_conformant is not the expected type, validation failed.")
        obj.callbacks&.is_a?(Array) != false || raise("Passed value for field obj.callbacks is not the expected type, validation failed.")
        obj.allowed_origins&.is_a?(Array) != false || raise("Passed value for field obj.allowed_origins is not the expected type, validation failed.")
        obj.web_origins&.is_a?(Array) != false || raise("Passed value for field obj.web_origins is not the expected type, validation failed.")
        obj.grant_types&.is_a?(Array) != false || raise("Passed value for field obj.grant_types is not the expected type, validation failed.")
        obj.jwt_configuration&.is_a?(Hash) != false || raise("Passed value for field obj.jwt_configuration is not the expected type, validation failed.")
        obj.signing_keys&.is_a?(Array) != false || raise("Passed value for field obj.signing_keys is not the expected type, validation failed.")
        obj.encryption_key&.is_a?(Hash) != false || raise("Passed value for field obj.encryption_key is not the expected type, validation failed.")
        obj.sso&.is_a?(Boolean) != false || raise("Passed value for field obj.sso is not the expected type, validation failed.")
        obj.sso_disabled&.is_a?(Boolean) != false || raise("Passed value for field obj.sso_disabled is not the expected type, validation failed.")
        obj.cross_origin_auth&.is_a?(Boolean) != false || raise("Passed value for field obj.cross_origin_auth is not the expected type, validation failed.")
        obj.cross_origin_loc&.is_a?(String) != false || raise("Passed value for field obj.cross_origin_loc is not the expected type, validation failed.")
        obj.custom_login_page_on&.is_a?(Boolean) != false || raise("Passed value for field obj.custom_login_page_on is not the expected type, validation failed.")
        obj.custom_login_page&.is_a?(String) != false || raise("Passed value for field obj.custom_login_page is not the expected type, validation failed.")
        obj.custom_login_page_preview&.is_a?(String) != false || raise("Passed value for field obj.custom_login_page_preview is not the expected type, validation failed.")
        obj.form_template&.is_a?(String) != false || raise("Passed value for field obj.form_template is not the expected type, validation failed.")
        obj.is_heroku_app&.is_a?(Boolean) != false || raise("Passed value for field obj.is_heroku_app is not the expected type, validation failed.")
        obj.addons&.is_a?(Hash) != false || raise("Passed value for field obj.addons is not the expected type, validation failed.")
        obj.token_endpoint_auth_method&.is_a?(String) != false || raise("Passed value for field obj.token_endpoint_auth_method is not the expected type, validation failed.")
        obj.client_metadata&.is_a?(Hash) != false || raise("Passed value for field obj.client_metadata is not the expected type, validation failed.")
        obj.mobile&.is_a?(Hash) != false || raise("Passed value for field obj.mobile is not the expected type, validation failed.")
      end
    end
  end
end
