# frozen_string_literal: true

module Seed
    module Types
        class CreateProblemResponse < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "SUCCESS"
            member -> { Seed::Problem::CreateProblemError }, key: "ERROR"
    end
end
