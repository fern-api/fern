# frozen_string_literal: true
require "json"

module SeedClient
  module V2
    module Problem
      class FunctionImplementation
        attr_reader :impl, :imports, :additional_properties
        # @param impl [String] 
        # @param imports [String] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::FunctionImplementation] 
        def initialze(impl:, imports: nil, additional_properties: nil)
          # @type [String] 
          @impl = impl
          # @type [String] 
          @imports = imports
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of FunctionImplementation
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::FunctionImplementation] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          impl = struct.impl
          imports = struct.imports
          new(impl: impl, imports: imports, additional_properties: struct)
        end
        # Serialize an instance of FunctionImplementation to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 impl: @impl,
 imports: @imports
}.to_json()
        end
      end
    end
  end
end