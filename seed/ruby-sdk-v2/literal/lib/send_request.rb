# frozen_string_literal: true

module Reference
    module Types
        class SendRequest < Internal::Types::Model
            field :prompt, Array, optional: true, nullable: true
            field :query, String, optional: true, nullable: true
            field :stream, Array, optional: true, nullable: true
            field :ending, Array, optional: true, nullable: true
            field :context, SomeLiteral, optional: true, nullable: true
            field :maybe_context, Array, optional: true, nullable: true
            field :container_object, ContainerObject, optional: true, nullable: true
        end
    end
end
