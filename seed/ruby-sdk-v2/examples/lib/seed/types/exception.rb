# frozen_string_literal: true

module Seed
    module Types
        class Exception < Internal::Types::Union

            discriminant :type

            member -> { Seed::Types::ExceptionInfo }, key: "GENERIC"
            member -> { Object }, key: "TIMEOUT"
    end
end
