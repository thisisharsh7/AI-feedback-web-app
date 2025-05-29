import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { listRepoContents } from '../utils/github';

const FolderTree = ({ owner, repo, path = '', onFileToggle, selectedFiles, fileIcon = '📘', fileTextColor = 'text-blue-700' }) => {
    const [items, setItems] = useState([]);
    const [expanded, setExpanded] = useState(path === '');
    const [loading, setLoading] = useState(false);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const content = await listRepoContents(owner, repo, path);
            const sorted = content.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
            });
            setItems(sorted);
        } catch (err) {
            console.error(`Error loading ${path}:`, err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async () => {
        if (!expanded && items.length === 0) await fetchItems();
        setExpanded(!expanded);
    };

    const handleFileClick = (filePath) => {
        onFileToggle(filePath);
    };

    useEffect(() => {
        if (path === '') fetchItems();
    }, []);

    return (
        <div className="pl-2">
            {path !== '' && (
                <button
                    onClick={toggleExpand}
                    className="flex items-center gap-1 text-gray-700 hover:text-black text-sm font-medium"
                >
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    📂 {path.split('/').pop()}
                </button>
            )}

            {loading && <div className="text-xs text-gray-500 pl-5">Loading...</div>}

            {expanded && items.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                    {items.map((item) => (
                        <div key={item.path}>
                            {item.type === 'dir' ? (
                                <FolderTree
                                    owner={owner}
                                    repo={repo}
                                    path={item.path}
                                    onFileToggle={onFileToggle}
                                    selectedFiles={selectedFiles}
                                    fileIcon={fileIcon}
                                    fileTextColor={fileTextColor}
                                />
                            ) : (
                                <label className={`flex items-center gap-2 text-sm cursor-pointer ${fileTextColor}`}>
                                    <input
                                        type="checkbox"
                                        className={`h-4 w-4 rounded-sm border-gray-400 bg-gray-100 checked:bg-blue-600 checked:border-blue-600 appearance-none cursor-pointer transition`}
                                        checked={selectedFiles.includes(item.path)}
                                        onChange={() => handleFileClick(item.path)}
                                    />
                                    {fileIcon} {item.name}
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FolderTree;
