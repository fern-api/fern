# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class Status < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Object }, key: "ACTIVE"
        member -> { String }, key: "ARCHIVED"
        member -> { String }, key: "SOFT_DELETED"
      end
    end
  end
end
