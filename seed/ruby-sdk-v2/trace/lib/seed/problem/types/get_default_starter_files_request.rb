# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class GetDefaultStarterFilesRequest < Internal::Types::Model
        field :input_params, lambda {
          Internal::Types::Array[Seed::Problem::Types::VariableTypeAndName]
        }, optional: false, nullable: false, api_name: "inputParams"
        field :output_type, lambda {
          Seed::Commons::Types::VariableType
        }, optional: false, nullable: false, api_name: "outputType"
        field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
      end
    end
  end
end
