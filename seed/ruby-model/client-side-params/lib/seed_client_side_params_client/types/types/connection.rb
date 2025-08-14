# frozen_string_literal: true

require "ostruct"
require "json"

module SeedClientSideParamsClient
  class Types
    # Represents an identity provider connection
    class Connection
      # @return [String] Connection identifier
      attr_reader :id
      # @return [String] Connection name
      attr_reader :name
      # @return [String] Display name for the connection
      attr_reader :display_name
      # @return [String] The identity provider identifier (auth0, google-oauth2, facebook, etc.)
      attr_reader :strategy
      # @return [Hash{String => Object}] Connection-specific configuration options
      attr_reader :options
      # @return [Array<String>] List of client IDs that can use this connection
      attr_reader :enabled_clients
      # @return [Array<String>] Applicable realms for enterprise connections
      attr_reader :realms
      # @return [Boolean] Whether this is a domain connection
      attr_reader :is_domain_connection
      # @return [Hash{String => Object}] Additional metadata
      attr_reader :metadata
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param id [String] Connection identifier
      # @param name [String] Connection name
      # @param display_name [String] Display name for the connection
      # @param strategy [String] The identity provider identifier (auth0, google-oauth2, facebook, etc.)
      # @param options [Hash{String => Object}] Connection-specific configuration options
      # @param enabled_clients [Array<String>] List of client IDs that can use this connection
      # @param realms [Array<String>] Applicable realms for enterprise connections
      # @param is_domain_connection [Boolean] Whether this is a domain connection
      # @param metadata [Hash{String => Object}] Additional metadata
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedClientSideParamsClient::Types::Connection]
      def initialize(id:, name:, strategy:, display_name: OMIT, options: OMIT, enabled_clients: OMIT, realms: OMIT,
                     is_domain_connection: OMIT, metadata: OMIT, additional_properties: nil)
        @id = id
        @name = name
        @display_name = display_name if display_name != OMIT
        @strategy = strategy
        @options = options if options != OMIT
        @enabled_clients = enabled_clients if enabled_clients != OMIT
        @realms = realms if realms != OMIT
        @is_domain_connection = is_domain_connection if is_domain_connection != OMIT
        @metadata = metadata if metadata != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "id": id,
          "name": name,
          "display_name": display_name,
          "strategy": strategy,
          "options": options,
          "enabled_clients": enabled_clients,
          "realms": realms,
          "is_domain_connection": is_domain_connection,
          "metadata": metadata
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Connection
      #
      # @param json_object [String]
      # @return [SeedClientSideParamsClient::Types::Connection]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        id = parsed_json["id"]
        name = parsed_json["name"]
        display_name = parsed_json["display_name"]
        strategy = parsed_json["strategy"]
        options = parsed_json["options"]
        enabled_clients = parsed_json["enabled_clients"]
        realms = parsed_json["realms"]
        is_domain_connection = parsed_json["is_domain_connection"]
        metadata = parsed_json["metadata"]
        new(
          id: id,
          name: name,
          display_name: display_name,
          strategy: strategy,
          options: options,
          enabled_clients: enabled_clients,
          realms: realms,
          is_domain_connection: is_domain_connection,
          metadata: metadata,
          additional_properties: struct
        )
      end

      # Serialize an instance of Connection to a JSON object
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
        obj.id.is_a?(String) != false || raise("Passed value for field obj.id is not the expected type, validation failed.")
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.display_name&.is_a?(String) != false || raise("Passed value for field obj.display_name is not the expected type, validation failed.")
        obj.strategy.is_a?(String) != false || raise("Passed value for field obj.strategy is not the expected type, validation failed.")
        obj.options&.is_a?(Hash) != false || raise("Passed value for field obj.options is not the expected type, validation failed.")
        obj.enabled_clients&.is_a?(Array) != false || raise("Passed value for field obj.enabled_clients is not the expected type, validation failed.")
        obj.realms&.is_a?(Array) != false || raise("Passed value for field obj.realms is not the expected type, validation failed.")
        obj.is_domain_connection&.is_a?(Boolean) != false || raise("Passed value for field obj.is_domain_connection is not the expected type, validation failed.")
        obj.metadata&.is_a?(Hash) != false || raise("Passed value for field obj.metadata is not the expected type, validation failed.")
      end
    end
  end
end
