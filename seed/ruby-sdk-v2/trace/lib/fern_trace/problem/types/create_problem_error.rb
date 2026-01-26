# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class CreateProblemError < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :error_type

        member -> { FernTrace::Problem::Types::GenericCreateProblemError }, key: "GENERIC"
      end
    end
  end
end
