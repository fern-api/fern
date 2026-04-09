# frozen_string_literal: true

module Seed
  module Commons
    module Types
      module Types
        class Data < Internal::Types::Model
          extend Seed::Internal::Types::Union

          discriminant :type

          member -> { String }, key: "STRING"
          member -> { String }, key: "BASE64"
        end
      end
    end
  end
end
