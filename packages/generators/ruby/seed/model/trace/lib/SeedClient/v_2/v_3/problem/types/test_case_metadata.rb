# frozen_string_literal: true

module SeedClient
  module V2
    module V3
      module Problem
        class TestCaseMetadata
          attr_reader :id, :name, :hidden, :additional_properties
          # @param id [V2::V3::Problem::TestCaseId] 
          # @param name [String] 
          # @param hidden [Boolean] 
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::TestCaseMetadata] 
          def initialze(id:, name:, hidden:, additional_properties: nil)
            # @type [V2::V3::Problem::TestCaseId] 
            @id = id
            # @type [String] 
            @name = name
            # @type [Boolean] 
            @hidden = hidden
            # @type [OpenStruct] 
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of TestCaseMetadata
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::TestCaseMetadata] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            id = V2::V3::Problem::TestCaseId.from_json(json_object: struct.id)
            name = struct.name
            hidden = struct.hidden
            new(id: id, name: name, hidden: hidden, additional_properties: struct)
          end
          # Serialize an instance of TestCaseMetadata to a JSON object
          #
          # @return [JSON] 
          def to_json
            {
 id: @id,
 name: @name,
 hidden: @hidden
}.to_json()
          end
        end
      end
    end
  end
end