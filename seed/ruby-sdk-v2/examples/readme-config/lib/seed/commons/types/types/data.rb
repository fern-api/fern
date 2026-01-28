# frozen_string_literal: true

module FernExamples
  module Commons
    module Types
      module Types
        class Data < Internal::Types::Model
          extend FernExamples::Internal::Types::Union

          discriminant :type

          member -> { String }, key: "STRING"
          member -> { String }, key: "BASE_64"
        end
      end
    end
  end
end
