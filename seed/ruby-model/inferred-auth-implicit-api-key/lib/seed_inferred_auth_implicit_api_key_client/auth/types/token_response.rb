# frozen_string_literal: true

require "ostruct"
require "json"

module SeedInferredAuthImplicitApiKeyClient
  class Auth
    # An auth token response.
    class TokenResponse
      # @return [String]
      attr_reader :access_token
      # @return [String]
      attr_reader :token_type
      # @return [Integer]
      attr_reader :expires_in
      # @return [String]
      attr_reader :scope
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param access_token [String]
      # @param token_type [String]
      # @param expires_in [Integer]
      # @param scope [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedInferredAuthImplicitApiKeyClient::Auth::TokenResponse]
      def initialize(access_token:, token_type:, expires_in:, scope: OMIT, additional_properties: nil)
        @access_token = access_token
        @token_type = token_type
        @expires_in = expires_in
        @scope = scope if scope != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "access_token": access_token,
          "token_type": token_type,
          "expires_in": expires_in,
          "scope": scope
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of TokenResponse
      #
      # @param json_object [String]
      # @return [SeedInferredAuthImplicitApiKeyClient::Auth::TokenResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        access_token = parsed_json["access_token"]
        token_type = parsed_json["token_type"]
        expires_in = parsed_json["expires_in"]
        scope = parsed_json["scope"]
        new(
          access_token: access_token,
          token_type: token_type,
          expires_in: expires_in,
          scope: scope,
          additional_properties: struct
        )
      end

      # Serialize an instance of TokenResponse to a JSON object
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
        obj.access_token.is_a?(String) != false || raise("Passed value for field obj.access_token is not the expected type, validation failed.")
        obj.token_type.is_a?(String) != false || raise("Passed value for field obj.token_type is not the expected type, validation failed.")
        obj.expires_in.is_a?(Integer) != false || raise("Passed value for field obj.expires_in is not the expected type, validation failed.")
        obj.scope&.is_a?(String) != false || raise("Passed value for field obj.scope is not the expected type, validation failed.")
      end
    end
  end
end
