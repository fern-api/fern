# frozen_string_literal: true

module Seed
  module Reference
    module Types
      class SendRequest < Internal::Types::Model
        field :prompt, -> { String }, optional: false, nullable: false
        field :query, -> { String }, optional: false, nullable: false
        field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
        field :ending, -> { String }, optional: false, nullable: false
        field :context, -> { String }, optional: false, nullable: false
        field :maybe_context, -> { String }, optional: true, nullable: false, api_name: "maybeContext"
        field :container_object, lambda {
          Seed::Reference::Types::ContainerObject
        }, optional: false, nullable: false, api_name: "containerObject"
      end
    end
  end
end
