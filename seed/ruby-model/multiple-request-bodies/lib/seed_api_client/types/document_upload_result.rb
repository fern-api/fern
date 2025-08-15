# frozen_string_literal: true

require "ostruct"
require "json"

module SeedApiClient
  class DocumentUploadResult
    # @return [String]
    attr_reader :file_id
    # @return [String]
    attr_reader :status
    # @return [OpenStruct] Additional properties unmapped to the current class definition
    attr_reader :additional_properties
    # @return [Object]
    attr_reader :_field_set
    protected :_field_set

    OMIT = Object.new

    # @param file_id [String]
    # @param status [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [SeedApiClient::DocumentUploadResult]
    def initialize(file_id: OMIT, status: OMIT, additional_properties: nil)
      @file_id = file_id if file_id != OMIT
      @status = status if status != OMIT
      @additional_properties = additional_properties
      @_field_set = { "fileId": file_id, "status": status }.reject do |_k, v|
        v == OMIT
      end
    end

    # Deserialize a JSON object to an instance of DocumentUploadResult
    #
    # @param json_object [String]
    # @return [SeedApiClient::DocumentUploadResult]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      parsed_json = JSON.parse(json_object)
      file_id = parsed_json["fileId"]
      status = parsed_json["status"]
      new(
        file_id: file_id,
        status: status,
        additional_properties: struct
      )
    end

    # Serialize an instance of DocumentUploadResult to a JSON object
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
      obj.file_id&.is_a?(String) != false || raise("Passed value for field obj.file_id is not the expected type, validation failed.")
      obj.status&.is_a?(String) != false || raise("Passed value for field obj.status is not the expected type, validation failed.")
    end
  end
end
