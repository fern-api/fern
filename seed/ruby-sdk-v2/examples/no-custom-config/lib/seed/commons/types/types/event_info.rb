# frozen_string_literal: true

module Seed
  module Commons
    module Types
      module Types
        class EventInfo < Internal::Types::Model
          extend Seed::Internal::Types::Union

          discriminant :type

          member -> { Seed::Commons::Types::Types::Metadata }, key: "METADATA"
          member -> { String }, key: "TAG"
        end
      end
    end
  end
end
