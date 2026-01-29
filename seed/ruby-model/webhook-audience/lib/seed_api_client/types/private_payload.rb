# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class PrivatePayload
    # @return [String]
    attr_reader :secret
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param secret [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::PrivatePayload]
    def initialize(secret:, additional_properties: nil)
      @secret = secret
      @additional_properties = additional_properties
      @_field_set = { "secret": secret }
    end

    # Deserialize a JSON object to an instance of PrivatePayload
    #
    # @param json_object [String]
    # @return [SeedApiClient::PrivatePayload]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      secret = parsed_json["secret"]
      new(secret: secret, additional_properties: struct)
    end

    # Serialize an instance of PrivatePayload to a JSON object
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
      obj.secret.is_a?(String) != false || raise("Passed value for field obj.secret is not the expected type, validation failed.")
    end
  end
end
