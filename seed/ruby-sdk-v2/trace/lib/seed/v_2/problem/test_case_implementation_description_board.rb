# frozen_string_literal: true

module Seed
    module Types
        class TestCaseImplementationDescriptionBoard < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "HTML"
            member -> { String }, key: "PARAM_ID"
    end
end
