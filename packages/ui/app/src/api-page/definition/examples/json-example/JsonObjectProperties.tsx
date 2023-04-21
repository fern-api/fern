import { JsonObjectProperty } from "./JsonObjectProperty";

export interface JsonObjectProperties {
    object: object;
}

export const JsonObjectProperties: React.FC<JsonObjectProperties> = ({ object }) => {
    const entries = Object.entries(object);
    return (
        <>
            {entries.map(([key, value], index) => (
                <JsonObjectProperty
                    key={key}
                    object={object}
                    propertyKey={key}
                    propertyValue={value}
                    isLastProperty={index === entries.length - 1}
                />
            ))}
        </>
    );
};
