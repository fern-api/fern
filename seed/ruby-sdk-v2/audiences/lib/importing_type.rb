# frozen_string_literal: true

module Foo
    module Types
        class ImportingType < Internal::Types::Model
            field :imported, Imported, optional: true, nullable: true
        end
    end
end
