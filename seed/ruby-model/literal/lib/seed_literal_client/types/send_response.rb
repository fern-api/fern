# frozen_string_literal: true

require "json"

module SeedLiteralClient
  class SendResponse
    attr_reader :message, :status, :success, :additional_properties

    # @param message [String]
    # @param status [Integer]
    # @param success [Boolean]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SendResponse]
    def initialize(message:, status:, success:, additional_properties: nil)
      # @type [String]
      @message = message
      # @type [Integer]
      @status = status
      # @type [Boolean]
      @success = success
      # @type [OpenStruct] Additional properties unmapped to the current class definition
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of SendResponse
    #
    # @param json_object [JSON]
    # @return [SendResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      JSON.parse(json_object)
      message = struct.message
      status = struct.status
      success = struct.success
      new(message: message, status: status, success: success, additional_properties: struct)
    end

    # Serialize an instance of SendResponse to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      { "message": @message, "status": @status, "success": @success }.to_json
    end

    # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
