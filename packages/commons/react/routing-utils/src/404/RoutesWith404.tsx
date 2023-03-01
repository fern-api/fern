import { Route, Routes } from "react-router-dom";
import { MissingRoute } from "./MissingRoute";

export declare namespace RoutesWith404 {
    export type Props = React.PropsWithChildren<{
        header?: JSX.Element;
    }>;
}

export const RoutesWith404: React.FC<RoutesWith404.Props> = ({ children, header }) => {
    return (
        <Routes>
            {children}
            <Route path="*" element={<MissingRoute header={header} />} />
        </Routes>
    );
};
