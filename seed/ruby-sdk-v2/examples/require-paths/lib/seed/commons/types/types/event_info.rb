# frozen_string_literal: true

module FernExamples
  module Commons
    module Types
      module Types
        class EventInfo < Internal::Types::Model
          extend FernExamples::Internal::Types::Union

          discriminant :type

          member -> { FernExamples::Commons::Types::Types::Metadata }, key: "METADATA"
          member -> { String }, key: "TAG"
        end
      end
    end
  end
end
