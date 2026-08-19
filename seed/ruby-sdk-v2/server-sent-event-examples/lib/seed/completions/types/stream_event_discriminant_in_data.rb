# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class StreamEventDiscriminantInData < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Completions::Types::GroupCreatedEvent }, key: "GROUP_CREATED"

        member -> { Seed::Completions::Types::GroupDeletedEvent }, key: "GROUP_DELETED"
      end
    end
  end
end
