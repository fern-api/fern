# frozen_string_literal: true

require_relative "../.."

module Seed
  module Problem
    module Types
      class CreateProblemError < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :error_type

        member -> { Seed::Problem::Types::GenericCreateProblemError }, key: "GENERIC"
      end
    end
  end
end
