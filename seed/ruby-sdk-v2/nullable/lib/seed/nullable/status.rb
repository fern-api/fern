# frozen_string_literal: true

module Seed
    module Types
        class Status < Internal::Types::Union

            discriminant :type

            member -> { Object }, key: "ACTIVE"
            member -> { String }, key: "ARCHIVED"
            member -> { String }, key: "SOFT_DELETED"
    end
end
