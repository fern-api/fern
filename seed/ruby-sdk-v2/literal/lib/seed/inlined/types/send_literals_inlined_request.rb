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
        field :aliased_context, -> { String }, optional: false, nullable: false, api_name: "aliasedContext"
        field :maybe_context, -> { String }, optional: true, nullable: false, api_name: "maybeContext"
        field :object_with_literal, lambda {
          Seed::Inlined::Types::ATopLevelLiteral
        }, optional: false, nullable: false, api_name: "objectWithLiteral"
      end
    end
  end
end
