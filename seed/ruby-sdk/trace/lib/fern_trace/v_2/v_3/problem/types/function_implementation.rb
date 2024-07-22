# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class FunctionImplementation
          # @return [String]
          attr_reader :impl
          # @return [String]
          attr_reader :imports
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param impl [String]
          # @param imports [String]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::FunctionImplementation]
          def initialize(impl:, imports: OMIT, additional_properties: nil)
            @impl = impl
            @imports = imports if imports != OMIT
            @additional_properties = additional_properties
            @_field_set = { "impl": impl, "imports": imports }.reject do |_k, v|
              v == OMIT
            end
          end

          # Deserialize a JSON object to an instance of FunctionImplementation
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::FunctionImplementation]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            impl = parsed_json["impl"]
            imports = parsed_json["imports"]
            new(
              impl: impl,
              imports: imports,
              additional_properties: struct
            )
          end

          # Serialize an instance of FunctionImplementation to a JSON object
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
            obj.impl.is_a?(String) != false || raise("Passed value for field obj.impl is not the expected type, validation failed.")
            obj.imports&.is_a?(String) != false || raise("Passed value for field obj.imports is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
