# frozen_string_literal: true

module Seed
  module Inlined
    module Types
      class SendLiteralsInlinedRequest < Internal::Types::Model
        field :prompt, -> { String }, optional: false, nullable: false
        field :context, -> { String }, optional: true, nullable: false
        field :query, -> { String }, optional: false, nullable: false
        field :temperature, -> { Integer }, optional: true, nullable: false
        field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :aliased_context, -> { String }, optional: false, nullable: false
        field :maybe_context, -> { String }, optional: true, nullable: false
        field :object_with_literal, -> { Seed::Inlined::Types::ATopLevelLiteral }, optional: false, nullable: false
      end
    end
  end
end
