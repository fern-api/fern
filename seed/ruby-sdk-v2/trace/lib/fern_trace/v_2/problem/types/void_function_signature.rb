# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class VoidFunctionSignature < Internal::Types::Model
          field :parameters, -> { Internal::Types::Array[FernTrace::V2::Problem::Types::Parameter] }, optional: false, nullable: false
        end
      end
    end
  end
end
