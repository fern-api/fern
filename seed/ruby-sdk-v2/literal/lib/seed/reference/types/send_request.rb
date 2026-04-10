# frozen_string_literal: true

module Seed
  module Reference
    module Types
      class SendRequest < Internal::Types::Model
        field :prompt, -> { Seed::Reference::Types::SendRequestPrompt }, optional: false, nullable: false
        field :query, -> { String }, optional: false, nullable: false
        field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :ending, -> { Seed::Reference::Types::SendRequestEnding }, optional: false, nullable: false
        field :context, -> { Seed::Types::SomeLiteral }, optional: false, nullable: false
        field :maybe_context, -> { Seed::Types::SomeLiteral }, optional: true, nullable: false, api_name: "maybeContext"
        field :container_object, -> { Seed::Types::ContainerObject }, optional: false, nullable: false, api_name: "containerObject"
      end
    end
  end
end
