# frozen_string_literal: true

module Seed
  module Types
    class CommonsData < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::CommonsDataString }, key: "STRING"
      member -> { Seed::Types::CommonsDataBase64 }, key: "BASE64"
    end
  end
end
