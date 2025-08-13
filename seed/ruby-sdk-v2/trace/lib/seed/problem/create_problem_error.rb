# frozen_string_literal: true

module Seed
    module Types
        class CreateProblemError < Internal::Types::Union

            discriminant :error_type

            member -> { Seed::Problem::GenericCreateProblemError }, key: "GENERIC"
    end
end
