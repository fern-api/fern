# frozen_string_literal: true

module Seed
  module Types
    class V2V3GetBasicSolutionFileRequest < Internal::Types::Model
      field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
      field :signature, -> { Seed::Types::V2V3NonVoidFunctionSignature }, optional: false, nullable: false
    end
  end
end
