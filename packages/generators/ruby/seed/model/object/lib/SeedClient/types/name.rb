# frozen_string_literal: true

require "json"

module SeedClient
  class Name
    attr_reader :id, :value, :additional_properties

    # @param id [String]
    # @param value [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [Name]
    def initialze(id:, value:, additional_properties: nil)
      # @type [String]
      @id = id
      # @type [String]
      @value = value
      # @type [OpenStruct]
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of Name
    #
    # @param json_object [JSON]
    # @return [Name]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      id = struct.id
      value = struct.value
      new(id: id, value: value, additional_properties: struct)
    end

    # Serialize an instance of Name to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      {
        id: @id,
        value: @value
      }.to_json
    end
  end
end
