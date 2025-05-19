import { useState, useEffect } from 'react';
import { listRepoContents } from '../utils/github';

const FolderTree = ({ owner, repo, path = '', onFileToggle, selectedFiles }) => {
    const [items, setItems] = useState([]);
    const [expanded, setExpanded] = useState(path === ''); // auto-expand root
    const [loaded, setLoaded] = useState(false);

    const fetchItems = async () => {
        const contents = await listRepoContents(owner, repo, path);
        setItems(contents);
        setLoaded(true);
    };

    useEffect(() => {
        if (expanded && !loaded) {
            fetchItems();
        }
    }, [expanded]);

    const toggleExpand = () => {
        setExpanded((prev) => !prev);
    };

    const folderName = path === '' ? `${repo} (root)` : path.split('/').pop();

    return (
        <div className="ml-2">
            <div
                className="cursor-pointer font-medium flex items-center gap-1"
                onClick={toggleExpand}
            >
                <span>{expanded ? '📂' : '📁'}</span>
                <span>{folderName}</span>
            </div>

            {expanded && (
                <ul className="pl-4 border-l border-gray-300 mt-1 space-y-1 text-sm">
                    {items.map((item) => {
                        if (item.type === 'dir') {
                            return (
                                <li key={item.path}>
                                    <FolderTree
                                        owner={owner}
                                        repo={repo}
                                        path={item.path}
                                        onFileToggle={onFileToggle}
                                        selectedFiles={selectedFiles}
                                    />
                                </li>
                            );
                        } else if (item.type === 'file') {
                            return (
                                <li key={item.path}>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(item.path)}
                                            onChange={() => onFileToggle(item.path)}
                                        />
                                        📄 {item.name}
                                    </label>
                                </li>
                            );
                        }
                        return null;
                    })}
                </ul>
            )}
        </div>
    );
};

export default FolderTree;
