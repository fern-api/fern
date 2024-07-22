# frozen_string_literal: true

require "ostruct"
require "json"

module SeedLiteralClient
  class SendResponse
    # @return [String]
    attr_reader :message
    # @return [Integer]
    attr_reader :status
    # @return [Boolean]
    attr_reader :success
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param message [String]
    # @param status [Integer]
    # @param success [Boolean]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedLiteralClient::SendResponse]
    def initialize(message:, status:, success:, additional_properties: nil)
      @message = message
      @status = status
      @success = success
      @additional_properties = additional_properties
      @_field_set = { "message": message, "status": status, "success": success }
    end

    # Deserialize a JSON object to an instance of SendResponse
    #
    # @param json_object [String]
    # @return [SeedLiteralClient::SendResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      message = parsed_json["message"]
      status = parsed_json["status"]
      success = parsed_json["success"]
      new(
        message: message,
        status: status,
        success: success,
        additional_properties: struct
      )
    end

    # Serialize an instance of SendResponse to a JSON object
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
      obj.message.is_a?(String) != false || raise("Passed value for field obj.message is not the expected type, validation failed.")
      obj.status.is_a?(Integer) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
      obj.success.is_a?(Boolean) != false || raise("Passed value for field obj.success is not the expected type, validation failed.")
    end
  end
end
