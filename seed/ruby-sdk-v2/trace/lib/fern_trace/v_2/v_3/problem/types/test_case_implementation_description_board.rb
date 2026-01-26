# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class TestCaseImplementationDescriptionBoard < Internal::Types::Model
            extend FernTrace::Internal::Types::Union

            discriminant :type

            member -> { String }, key: "HTML"
            member -> { String }, key: "PARAM_ID"
          end
        end
      end
    end
  end
end
