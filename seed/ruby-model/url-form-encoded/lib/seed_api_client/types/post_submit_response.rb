# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class PostSubmitResponse
    # @return [String]
    attr_reader :status
    # @return [String]
    attr_reader :message
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param status [String]
    # @param message [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::PostSubmitResponse]
    def initialize(status: OMIT, message: OMIT, additional_properties: nil)
      @status = status if status != OMIT
      @message = message if message != OMIT
      @additional_properties = additional_properties
      @_field_set = { "status": status, "message": message }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of PostSubmitResponse
    #
    # @param json_object [String]
    # @return [SeedApiClient::PostSubmitResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      status = parsed_json["status"]
      message = parsed_json["message"]
      new(
        status: status,
        message: message,
        additional_properties: struct
      )
    end

    # Serialize an instance of PostSubmitResponse to a JSON object
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
      obj.status&.is_a?(String) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      obj.message&.is_a?(String) != false || raise("Passed value for field obj.message is not the expected type, validation failed.")
    end
  end
end
