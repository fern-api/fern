# frozen_string_literal: true

module SeedClient
  module Commons
    module Metadata
      class Metadata
        attr_reader :id, :data, :additional_properties

        # @param id [String]
        # @param data [Hash{String => String}]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [Commons::Metadata::Metadata]
        def initialze(id:, data: nil, additional_properties: nil)
          # @type [String]
          @id = id
          # @type [Hash{String => String}]
          @data = data
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Metadata
        #
        # @param json_object [JSON]
        # @return [Commons::Metadata::Metadata]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          id = struct.id
          data = struct.data
          new(id: id, data: data, additional_properties: struct)
        end

        # Serialize an instance of Metadata to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            id: @id,
            data: @data
          }.to_json
        end
      end
    end
  end
end
