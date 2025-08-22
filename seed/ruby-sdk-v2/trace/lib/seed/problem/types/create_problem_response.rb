# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class CreateProblemResponse < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "SUCCESS"
        member -> { Seed::Problem::Types::CreateProblemError }, key: "ERROR"
      end
    end
  end
end
