# frozen_string_literal: true

module Seed
  module Types
    class DiscriminatedLiteral < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::DiscriminatedLiteralCustomName }, key: "CUSTOM_NAME"
      member -> { Seed::Types::DiscriminatedLiteralDefaultName }, key: "DEFAULT_NAME"
      member -> { Seed::Types::DiscriminatedLiteralGeorge }, key: "GEORGE"
      member -> { Seed::Types::DiscriminatedLiteralLiteralGeorge }, key: "LITERAL_GEORGE"
    end
  end
end
