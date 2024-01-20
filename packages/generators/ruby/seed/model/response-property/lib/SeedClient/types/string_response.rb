# frozen_string_literal: true

module SeedClient
  class StringResponse
    attr_reader :data, :additional_properties

    # @param data [String]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [StringResponse]
    def initialze(data:, additional_properties: nil)
      # @type [String]
      @data = data
      # @type [OpenStruct]
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of StringResponse
    #
    # @param json_object [JSON]
    # @return [StringResponse]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      data = struct.data
      new(data: data, additional_properties: struct)
    end

    # Serialize an instance of StringResponse to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      {
        data: @data
      }.to_json
    end
  end
end
