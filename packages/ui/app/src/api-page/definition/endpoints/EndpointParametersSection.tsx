import React from "react";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointSection } from "./EndpointSection";

export declare namespace EndpointParametersSection {
    export interface Props {
        title: string;
        parameters: EndpointParameter.Props[];
    }
}

export const EndpointParametersSection: React.FC<EndpointParametersSection.Props> = ({ title, parameters }) => {
    return (
        <EndpointSection title={title}>
            <div className="flex flex-col">
                {parameters.map((parameter, index) => (
                    <div className="flex flex-col" key={index}>
                        <TypeComponentSeparator />
                        <EndpointParameter {...parameter} />
                    </div>
                ))}
            </div>
        </EndpointSection>
    );
};
