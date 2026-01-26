# frozen_string_literal: true

module FernExamples
  module Types
    module Types
      class Metadata < Internal::Types::Model
        extend FernExamples::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "HTML"
        member -> { String }, key: "MARKDOWN"
      end
    end
  end
end
