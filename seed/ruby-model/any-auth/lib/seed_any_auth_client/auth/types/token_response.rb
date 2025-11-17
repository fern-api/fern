# frozen_string_literal: true

require "ostruct"
require "json"

module SeedAnyAuthClient
  class Auth
    # An OAuth token response.
    class TokenResponse
      # @return [String]
      attr_reader :access_token
      # @return [Integer]
      attr_reader :expires_in
      # @return [String]
      attr_reader :refresh_token
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param access_token [String]
      # @param expires_in [Integer]
      # @param refresh_token [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedAnyAuthClient::Auth::TokenResponse]
      def initialize(access_token:, expires_in: OMIT, refresh_token: OMIT, additional_properties: nil)
        @access_token = access_token
        @expires_in = expires_in if expires_in != OMIT
        @refresh_token = refresh_token if refresh_token != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "access_token": access_token,
          "expires_in": expires_in,
          "refresh_token": refresh_token
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of TokenResponse
      #
      # @param json_object [String]
      # @return [SeedAnyAuthClient::Auth::TokenResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        access_token = parsed_json["access_token"]
        expires_in = parsed_json["expires_in"]
        refresh_token = parsed_json["refresh_token"]
        new(
          access_token: access_token,
          expires_in: expires_in,
          refresh_token: refresh_token,
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
        obj.expires_in&.is_a?(Integer) != false || raise("Passed value for field obj.expires_in is not the expected type, validation failed.")
        obj.refresh_token&.is_a?(String) != false || raise("Passed value for field obj.refresh_token is not the expected type, validation failed.")
      end
    end
  end
end
