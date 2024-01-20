# frozen_string_literal: true

module SeedClient
  class WithMetadata
    attr_reader :metadata, :additional_properties

    # @param metadata [Hash{String => String}]
    # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
    # @return [WithMetadata]
    def initialze(metadata:, additional_properties: nil)
      # @type [Hash{String => String}]
      @metadata = metadata
      # @type [OpenStruct]
      @additional_properties = additional_properties
    end

    # Deserialize a JSON object to an instance of WithMetadata
    #
    # @param json_object [JSON]
    # @return [WithMetadata]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      metadata = struct.metadata
      new(metadata: metadata, additional_properties: struct)
    end

    # Serialize an instance of WithMetadata to a JSON object
    #
    # @return [JSON]
    def to_json(*_args)
      {
        metadata: @metadata
      }.to_json
    end
  end
end
