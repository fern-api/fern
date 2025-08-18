# frozen_string_literal: true

require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    class Identity
      # @return [String]
      attr_reader :connection
      # @return [String]
      attr_reader :user_id
      # @return [String]
      attr_reader :provider
      # @return [Boolean]
      attr_reader :is_social
      # @return [String]
      attr_reader :access_token
      # @return [Integer]
      attr_reader :expires_in
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param connection [String]
      # @param user_id [String]
      # @param provider [String]
      # @param is_social [Boolean]
      # @param access_token [String]
      # @param expires_in [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::Identity]
      def initialize(connection:, user_id:, provider:, is_social:, access_token: OMIT, expires_in: OMIT,
                     additional_properties: nil)
        @connection = connection
        @user_id = user_id
        @provider = provider
        @is_social = is_social
        @access_token = access_token if access_token != OMIT
        @expires_in = expires_in if expires_in != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "connection": connection,
          "user_id": user_id,
          "provider": provider,
          "is_social": is_social,
          "access_token": access_token,
          "expires_in": expires_in
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Identity
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::Identity]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        connection = parsed_json["connection"]
        user_id = parsed_json["user_id"]
        provider = parsed_json["provider"]
        is_social = parsed_json["is_social"]
        access_token = parsed_json["access_token"]
        expires_in = parsed_json["expires_in"]
        new(
          connection: connection,
          user_id: user_id,
          provider: provider,
          is_social: is_social,
          access_token: access_token,
          expires_in: expires_in,
          additional_properties: struct
        )
      end

      # Serialize an instance of Identity to a JSON object
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
        obj.connection.is_a?(String) != false || raise("Passed value for field obj.connection is not the expected type, validation failed.")
        obj.user_id.is_a?(String) != false || raise("Passed value for field obj.user_id is not the expected type, validation failed.")
        obj.provider.is_a?(String) != false || raise("Passed value for field obj.provider is not the expected type, validation failed.")
        obj.is_social.is_a?(Boolean) != false || raise("Passed value for field obj.is_social is not the expected type, validation failed.")
        obj.access_token&.is_a?(String) != false || raise("Passed value for field obj.access_token is not the expected type, validation failed.")
        obj.expires_in&.is_a?(Integer) != false || raise("Passed value for field obj.expires_in is not the expected type, validation failed.")
      end
    end
  end
end
