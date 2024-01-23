# frozen_string_literal: true

require "json"

module SeedClient
  module V2
    module V3
      module Problem
        class FunctionImplementation
          attr_reader :impl, :imports, :additional_properties

          # @param impl [String]
          # @param imports [String]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::FunctionImplementation]
          def initialize(impl:, imports: nil, additional_properties: nil)
            # @type [String]
            @impl = impl
            # @type [String]
            @imports = imports
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of FunctionImplementation
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::FunctionImplementation]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            impl = struct.impl
            imports = struct.imports
            new(impl: impl, imports: imports, additional_properties: struct)
          end

          # Serialize an instance of FunctionImplementation to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "impl": @impl, "imports": @imports }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            obj.impl.is_a?(String) != false || raise("Passed value for field obj.impl is not the expected type, validation failed.")
            obj.imports&.is_a?(String) != false || raise("Passed value for field obj.imports is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
