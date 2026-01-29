# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class TestCaseImplementationDescriptionBoard < Internal::Types::Model
          extend Seed::Internal::Types::Union

          discriminant :type

          member -> { String }, key: "HTML"
          member -> { String }, key: "PARAM_ID"
        end
      end
    end
  end
end
