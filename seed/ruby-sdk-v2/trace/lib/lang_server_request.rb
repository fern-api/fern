# frozen_string_literal: true

module LangServer
    module Types
        class LangServerRequest < Internal::Types::Model
            field :request, Object, optional: true, nullable: true
        end
    end
end
