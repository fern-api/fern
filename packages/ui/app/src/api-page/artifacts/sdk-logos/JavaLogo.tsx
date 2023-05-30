export declare namespace JavaLogo {
    export interface Props {
        className?: string;
    }
}

export const JavaLogo: React.FC<JavaLogo.Props> = ({ className }) => {
    return (
        <svg
            className={className}
            fill="currentcolor"
            height="40"
            viewBox="0 0 16 16"
            width="40"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                clipRule="evenodd"
                d="M8.70711 7.29289L13.125 2.875L14.125 1.875H12.7108H2.875H1.875V2.875V13.125V14.125H2.875H12.7108H14.125L13.125 13.125L8.70711 8.70711L8 8L8.70711 7.29289ZM11.7108 13.125L7.29289 8.70711L6.58579 8L7.29289 7.29289L11.7108 2.875H2.875V13.125H11.7108Z"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};
