# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class GetBasicSolutionFileRequest < Internal::Types::Model
            field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
            field :signature, lambda {
              Seed::V2::V3::Problem::Types::NonVoidFunctionSignature
            }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
