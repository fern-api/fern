# frozen_string_literal: true

module Seed
    module Types
        class ExceptionV2 < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::ExceptionInfo }, key: "GENERIC"
            member -> { Object }, key: "TIMEOUT"
    end
end
