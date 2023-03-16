import { Colors, IconSize } from "@blueprintjs/core";

export declare namespace EndpointIcon {
    export interface Props {
        size?: number;
    }
}

const VIEW_BOX_SIZE = 100;
const LINE_HEIGHT = 14;
const LINE_COLOR = Colors.BLUE3;

export const EndpointIcon: React.FC<EndpointIcon.Props> = ({ size = IconSize.STANDARD }) => {
    return (
        <div style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`} xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width={VIEW_BOX_SIZE} height={VIEW_BOX_SIZE} fill="#e2e2e2" rx="15" />
                <rect
                    x="0"
                    y={(VIEW_BOX_SIZE - LINE_HEIGHT) / 2}
                    width={VIEW_BOX_SIZE / 2}
                    height={LINE_HEIGHT}
                    fill={LINE_COLOR}
                />
                <circle cx={VIEW_BOX_SIZE / 2} cy={VIEW_BOX_SIZE / 2} r={LINE_HEIGHT * 2} fill={LINE_COLOR} />
                <circle cx={VIEW_BOX_SIZE / 2} cy={VIEW_BOX_SIZE / 2} r={LINE_HEIGHT} fill="white" />
            </svg>
        </div>
    );
};
