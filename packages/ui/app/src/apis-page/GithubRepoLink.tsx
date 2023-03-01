import { BsGithub } from "react-icons/bs";

export const GithubRepoLink: React.FC = () => {
    return (
        <a
            className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black"
            href="https://google.com"
            target="_blank"
            rel="noreferrer noopener"
        >
            <BsGithub size={20} />
        </a>
    );
};
