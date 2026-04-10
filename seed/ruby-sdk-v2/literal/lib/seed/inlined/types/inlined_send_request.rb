# frozen_string_literal: true

module Seed
  module Inlined
    module Types
      class InlinedSendRequest < Internal::Types::Model
        field :prompt, -> { Seed::Inlined::Types::InlinedSendRequestPrompt }, optional: false, nullable: false
        field :context, -> { Seed::Inlined::Types::InlinedSendRequestContext }, optional: true, nullable: false
        field :query, -> { String }, optional: false, nullable: false
        field :temperature, -> { Integer }, optional: true, nullable: false
        field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :aliased_context, -> { Seed::Types::SomeAliasedLiteral }, optional: false, nullable: false, api_name: "aliasedContext"
        field :maybe_context, -> { Seed::Types::SomeAliasedLiteral }, optional: true, nullable: false, api_name: "maybeContext"
        field :object_with_literal, -> { Seed::Types::ATopLevelLiteral }, optional: false, nullable: false, api_name: "objectWithLiteral"
      end
    end
  end
end
