# frozen_string_literal: true

module Types
    module Types
        class Moment < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :date, Date, optional: true, nullable: true
            field :datetime, DateTime, optional: true, nullable: true
        end
    end
end
