# frozen_string_literal: true

module Seed
  module Types
    class CreateProblemResponse < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::CreateProblemResponseSuccess }, key: "SUCCESS"
      member -> { Seed::Types::CreateProblemResponseError }, key: "ERROR"
    end
  end
end
