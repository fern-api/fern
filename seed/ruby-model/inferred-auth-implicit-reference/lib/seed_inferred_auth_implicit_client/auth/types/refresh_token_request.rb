# frozen_string_literal: true

require "ostruct"
require "json"

module SeedInferredAuthImplicitClient
  class Auth
    # A request to refresh an OAuth token.
    class RefreshTokenRequest
      # @return [String]
      attr_reader :client_id
      # @return [String]
      attr_reader :client_secret
      # @return [String]
      attr_reader :refresh_token
      # @return [String]
      attr_reader :audience
      # @return [String]
      attr_reader :grant_type
      # @return [String]
      attr_reader :scope
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param client_id [String]
      # @param client_secret [String]
      # @param refresh_token [String]
      # @param audience [String]
      # @param grant_type [String]
      # @param scope [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedInferredAuthImplicitClient::Auth::RefreshTokenRequest]
      def initialize(client_id:, client_secret:, refresh_token:, audience:, grant_type:, scope: OMIT,
                     additional_properties: nil)
        @client_id = client_id
        @client_secret = client_secret
        @refresh_token = refresh_token
        @audience = audience
        @grant_type = grant_type
        @scope = scope if scope != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "client_id": client_id,
          "client_secret": client_secret,
          "refresh_token": refresh_token,
          "audience": audience,
          "grant_type": grant_type,
          "scope": scope
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of RefreshTokenRequest
      #
      # @param json_object [String]
      # @return [SeedInferredAuthImplicitClient::Auth::RefreshTokenRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        client_id = parsed_json["client_id"]
        client_secret = parsed_json["client_secret"]
        refresh_token = parsed_json["refresh_token"]
        audience = parsed_json["audience"]
        grant_type = parsed_json["grant_type"]
        scope = parsed_json["scope"]
        new(
          client_id: client_id,
          client_secret: client_secret,
          refresh_token: refresh_token,
          audience: audience,
          grant_type: grant_type,
          scope: scope,
          additional_properties: struct
        )
      end

      # Serialize an instance of RefreshTokenRequest to a JSON object
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
        obj.client_secret.is_a?(String) != false || raise("Passed value for field obj.client_secret is not the expected type, validation failed.")
        obj.refresh_token.is_a?(String) != false || raise("Passed value for field obj.refresh_token is not the expected type, validation failed.")
        obj.audience.is_a?(String) != false || raise("Passed value for field obj.audience is not the expected type, validation failed.")
        obj.grant_type.is_a?(String) != false || raise("Passed value for field obj.grant_type is not the expected type, validation failed.")
        obj.scope&.is_a?(String) != false || raise("Passed value for field obj.scope is not the expected type, validation failed.")
      end
    end
  end
end
