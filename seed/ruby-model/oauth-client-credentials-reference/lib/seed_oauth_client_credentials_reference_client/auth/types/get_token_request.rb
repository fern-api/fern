# frozen_string_literal: true

require "ostruct"
require "json"

module SeedOauthClientCredentialsReferenceClient
  class Auth
    # The request body for getting an OAuth token.
    class GetTokenRequest
      # @return [String]
      attr_reader :client_id
      # @return [String]
      attr_reader :client_secret
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param client_id [String]
      # @param client_secret [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedOauthClientCredentialsReferenceClient::Auth::GetTokenRequest]
      def initialize(client_id:, client_secret:, additional_properties: nil)
        @client_id = client_id
        @client_secret = client_secret
        @additional_properties = additional_properties
        @_field_set = { "client_id": client_id, "client_secret": client_secret }
      end

      # Deserialize a JSON object to an instance of GetTokenRequest
      #
      # @param json_object [String]
      # @return [SeedOauthClientCredentialsReferenceClient::Auth::GetTokenRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        client_id = parsed_json["client_id"]
        client_secret = parsed_json["client_secret"]
        new(
          client_id: client_id,
          client_secret: client_secret,
          additional_properties: struct
        )
      end

      # Serialize an instance of GetTokenRequest to a JSON object
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
      end
    end
  end
end
