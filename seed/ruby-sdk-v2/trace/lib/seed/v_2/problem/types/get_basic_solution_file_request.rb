# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class GetBasicSolutionFileRequest < Internal::Types::Model
          field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
          field :signature, -> { Seed::V2::Problem::Types::NonVoidFunctionSignature }, optional: false, nullable: false
        end
      end
    end
  end
end
