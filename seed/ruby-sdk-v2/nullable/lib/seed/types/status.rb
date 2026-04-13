# frozen_string_literal: true

module Seed
  module Types
    class Status < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::StatusActive }, key: "ACTIVE"
      member -> { Seed::Types::StatusArchived }, key: "ARCHIVED"
      member -> { Seed::Types::StatusSoftDeleted }, key: "SOFT_DELETED"
    end
  end
end
