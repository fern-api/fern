# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class CreateProblemResponse < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "SUCCESS"
        member -> { FernTrace::Problem::Types::CreateProblemError }, key: "ERROR"
      end
    end
  end
end
