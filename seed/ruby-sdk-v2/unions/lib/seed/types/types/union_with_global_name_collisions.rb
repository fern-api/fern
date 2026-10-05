# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithGlobalNameCollisions < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "DATE"

        member -> { String }, key: "ERROR"

        member -> { String }, key: "AIM"
      end
    end
  end
end
